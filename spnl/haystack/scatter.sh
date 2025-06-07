for k in 1 2 4 8
do
    for T in $(seq 8 8)
    do
        cat ~/git/spnl/haystack/experiment_data/out-v3.n8.k$k | \
            gawk -v k=$k -v T=$T '{
p=int($5*$3);
r=int($6*$3);
printf "%3d %3d %d %4d %s\n", r, p, k, $4, $1;
}'
    done
done
