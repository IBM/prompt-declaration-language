from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader
from litellm import embedding
from litellm.exceptions import APIConnectionError
from pymilvus import MilvusClient


def parse(filename: str, chunk_size: int, chunk_overlap: int) -> list[str]:
    loader = PyPDFLoader(filename)

    docs = loader.load()
    # 'docs' will be a list[langchain_core.documents.base.Document],
    # one entry per page.  We don't want to return this, because PDL only
    # wants types that work in JSON schemas.

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len,
        is_separator_regex=False,
    )

    split_docs = text_splitter.split_documents(docs)

    # Note that this throws away the metadata.
    return [doc.page_content for doc in split_docs]


def rag_index(
    inp: list[str],
    encoder_model: str,
    embed_dimension: int,
    database_name: str,
    collection_name: str,
):
    # Have LiteLLM embed the passages
    response = embedding(
        model=encoder_model,
        input=inp,
    )

    client = MilvusClient(
        database_name
    )  # Use URL if talking to remote Milvus (non-Lite)

    if client.has_collection(collection_name=collection_name):
        client.drop_collection(collection_name=collection_name)
    client.create_collection(
        collection_name=collection_name, dimension=embed_dimension, overwrite=True
    )

    mid = 0  # There is also an auto-id feature in Milvus, which we are not using
    for text in inp:
        vector = response.data[mid]["embedding"]  # type: ignore
        client.insert(
            collection_name=collection_name,
            data=[
                {
                    "id": mid,
                    "text": text,
                    "vector": vector,
                    # We SHOULD set "source" and "url" based on the metadata we threw away in parse()
                }
            ],
        )
        mid = mid + 1

    return True


# Global cache of database clients.
# (We do this so the PDL programmer doesn't need to explicitly maintain the client connection)
DATABASE_CLIENTS: dict[str, MilvusClient] = {}


def get_or_create_client(database_name: str):
    if database_name in DATABASE_CLIENTS:
        return DATABASE_CLIENTS[database_name]

    client = MilvusClient(
        database_name
    )  # Use URL if talking to remote Milvus (non-Lite)
    DATABASE_CLIENTS[database_name] = client
    return client


# Search vector database collection for input.
# The output is 'limit' vectors, as strings, concatenated together
def rag_retrieve(
    inp: str, encoder_model: str, limit: int, database_name: str, collection_name: str
) -> str:
    # Embed the question as a vector
    try:
        response = embedding(
            model=encoder_model,
            input=[inp],
        )
    except APIConnectionError:
        # Retry because of https://github.com/BerriAI/litellm/issues/7667
        response = embedding(
            model=encoder_model,
            input=[inp],
        )
    except BaseException as be:
        # Typically litellm.exceptions.APIConnectionError
        return f"Unexpected {type(be)}: be={be}"

    data = response.data[0]["embedding"]  # type: ignore

    milvus_client = get_or_create_client(database_name)
    search_res = milvus_client.search(
        collection_name=collection_name,
        data=[data],
        limit=limit,  # Return top n results
        search_params={"metric_type": "COSINE", "params": {}},
        output_fields=["text"],  # Return the text field
    )

    # Note that this throws away document metadata (if any)
    return "\n".join([res["entity"]["text"] for res in search_res[0]])
