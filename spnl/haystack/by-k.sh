T=${1-6}

for m in ollama/granite3.3:2b ollama/granite3.3:8b
do for k in 1 2 4 8
   do [ -f ./experiment_data/out-v3.n8.k$k ] && cat ./experiment_data/out-v3.n8.k$k | \
           gawk -v k=$k -v T=$T -v m=$m '
$1==m {
  p=int($5*$3); # this is the number of identified cat names that are actual cat names ($3 is the number of named cats; $5 is the precision metric for this run)
  r=int($6*$3); # this is the number of actual cat names that were identified (ibid, with $5 being the recall metric for this run)
  C[$4]++;
  if (p>=T) Np[$4]++;
  if (r>=T) Nr[$4]++
}
END {
  for (x in C) {
     fracOfRunsWithSufficientPrecision = Np[x]/C[x]
     fracOfRunsWithSufficientRecall = Nr[x]/C[x]
     printf "%3d %3d %d %4d %s\n", fracOfRunsWithSufficientPrecision*100,fracOfRunsWithSufficientRecall*100, k,x,m
  }
}' | sort -k6 -k5 -n ; done; done
