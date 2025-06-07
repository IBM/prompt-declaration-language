cat human-gen-rag-questions.txt | gxargs -P1 -d '\n' -L1 spnl -r govt.jsonl -d rag -m ollama/granite3.3:8b -w >& govt.overlap
