k=${1-8}
h=${2-1000}
m=${3-ollama/granite3.3:2b}

if [ ! -f ./experiment_data/out-v3.n8.k$k ]
then exit 1
fi

N=$(cat ./experiment_data/out-v3.n8.k$k | awk -v m=$m -v h=$h '$1==m && $4==h {print $0}' | wc -l | xargs)

cat ./experiment_data/out-v3.n8.k$k | \
    awk -v m=$m -v h=$h '$1==m && $4==h { print $5}' | \
    sort -k1 -n -r | \
    awk -v N=$N 'BEGIN {n25=int(25*N/100); n50=int(50*N/100); n75=int(75*N/100); n90=int(90*N/100); n99=int(99*N/100);} FNR==n25 {print "precision p25", $1} FNR==n50 {print "precision p50", $1} FNR==n75 {print "precision p75", $1} FNR==n90 {print "precision p90", $1} FNR==n99 {print "precision p99", $1}'

cat ./experiment_data/out-v3.n8.k$k | \
    awk -v m=$m -v h=$h '$1==m && $4==h { print $6}' | \
    sort -k1 -n -r | \
    awk -v N=$N 'BEGIN {n25=int(25*N/100); n50=int(50*N/100); n75=int(75*N/100); n90=int(90*N/100); n99=int(99*N/100);} FNR==n25 {print "recall p25", $1} FNR==n50 {print "recall p50", $1} FNR==n75 {print "recall p75", $1} FNR==n90 {print "recall p90", $1} FNR==n99 {print "recall p99", $1}'

