use std::sync::Arc;

use anyhow::Ok;
use arrow_array::{
    FixedSizeListArray, RecordBatch, RecordBatchIterator, StringArray,
    /*cast::AsArray,*/ types::Float32Type,
};
use arrow_schema::ArrowError;

use lancedb::query::{ExecutableQuery, QueryBase};

use futures::TryStreamExt;
use lancedb::{
    Table,
    arrow::arrow_schema::{DataType, Field, Schema},
};
use tracing::warn;

pub struct VecDB {
    default_table: Table,
}

impl VecDB {
    pub async fn connect(db_path: &str, default_table: &str) -> anyhow::Result<Self> {
        let connection = lancedb::connect(db_path).execute().await?;
        let table_exists = connection
            .table_names()
            .execute()
            .await?
            .contains(&default_table.to_string());
        if !table_exists {
            warn!("Table {} does not exist, creating it", default_table);
            let schema = Self::get_default_schema();
            connection
                .create_empty_table(default_table, schema)
                .execute()
                .await?;
        }
        let table = connection.open_table(default_table).execute().await?;
        Ok(Self {
            default_table: table,
        })
    }

    pub async fn find_similar(
        &self,
        vector: Vec<f32>,
        n: usize,
    ) -> anyhow::Result<Vec<RecordBatch>> {
        Ok(self
            .default_table
            .query()
            .nearest_to(vector)?
            .distance_range(None, Some(1.0))
            .limit(n)
            .execute()
            .await?
            .try_collect::<Vec<_>>()
            .await?)
    }

    /// Get the default schema for the VecDB
    fn get_default_schema() -> Arc<Schema> {
        Arc::new(Schema::new(vec![
            Field::new("filename", DataType::Utf8, false),
            Field::new(
                "vector",
                DataType::FixedSizeList(
                    Arc::new(Field::new("item", DataType::Float32, true)),
                    1024,
                ),
                true,
            ),
        ]))
    }

    pub async fn add_vector(
        &self,
        filenames: &[String],
        vectors: Vec<Vec<f32>>,
        vec_dim: i32,
    ) -> anyhow::Result<()> {
        let schema = self.default_table.schema().await?;
        let key_array = StringArray::from_iter_values(filenames);
        let vectors_array = FixedSizeListArray::from_iter_primitive::<Float32Type, _, _>(
            vectors
                .into_iter()
                .map(|v| Some(v.into_iter().map(|i| Some(i)))),
            vec_dim,
        );
        let batches = vec![
            Ok(RecordBatch::try_new(
                schema.clone(),
                vec![Arc::new(key_array), Arc::new(vectors_array)],
            )?)
            .map_err(|e| ArrowError::from_external_error(e.into())),
        ];
        let batch_iterator = RecordBatchIterator::new(batches, schema);
        // Create a RecordBatch stream.
        let boxed_batches = Box::new(batch_iterator);

        // add them to the table
        //self.default_table.add(boxed_batches).execute().await?;

        let mut merge_insert = self.default_table.merge_insert(&["filename"]);
        merge_insert
            .when_matched_update_all(None)
            .when_not_matched_insert_all();
        merge_insert.execute(Box::new(boxed_batches)).await?;

        Ok(())
    }

    pub fn sanitize_table_name(name: &str) -> String {
        name.replace("/", "_").replace(":", "_")
    }
}
