import pandas as pd
from sklearn.model_selection import train_test_split
import json
from pathlib import Path

TRAIN_RATIO = 0.6
VALIDATION_RATIO = 0.2
TEST_RATIO = 0.2


RANDOM_STATE = 42

def split_json_data(file_path, train_r, val_r, test_r, rs):
    with open(file_path, 'r') as f:
        data = json.load(f)
    
    # Convert to a pandas DataFrame for easy manipulation
    df = pd.DataFrame(data)
    
    # Check if the ratios sum to 1
    if abs(train_r + val_r + test_r - 1.0) > 1e-6:
        raise ValueError("Train, validation, and test ratios must sum to 1.0")

    # 2. First split: Main set (Train + Validation) and Test set
    # The 'test_size' here is the proportion for the *final* test set
    main_df, test_df = train_test_split(df, test_size=test_r, random_state=rs, shuffle=True)
    
    # 3. Second split: Train and Validation sets from the Main set
    # The proportion for the validation set needs to be adjusted relative to the remaining data
    # Calculate the new validation ratio: val_r / (train_r + val_r)
    new_val_ratio = val_r / (train_r + val_r)
    train_df, val_df = train_test_split(main_df, test_size=new_val_ratio, random_state=rs, shuffle=True)
    
    return train_df, val_df, test_df

# Example usage:
# Replace 'your_data.json' with the path to your JSON file

train_data, val_data, test_data = split_json_data(
    'assets_jsonl/ci.json', 
    TRAIN_RATIO, 
    VALIDATION_RATIO, 
    TEST_RATIO, 
    RANDOM_STATE
)

out_dir = Path("assets_jsonl")

# You can now use train_data, val_data, and test_data as pandas DataFrames.
# To save them back to JSON files:
train = train_data.to_json(out_dir /'train.jsonl', orient='records', lines=True)
val = val_data.to_json(out_dir /'validation.jsonl', orient='records', lines=True)
test = test_data.to_json(out_dir /'test.jsonl', orient='records', lines=True)
