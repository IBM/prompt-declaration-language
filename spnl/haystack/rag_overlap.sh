awk '
$1=="RAGSizes" {
    ns=split($0,S);
    TS=0;
    for (i=2;i<=ns;i++) {TS+=S[i]}
}
$1=="RAGHashes" {
    if (prev != "") {
        n1=split(prev,A);
        n2=split($0,B);
        delete M;
        for (i=2;i<=n1;i++) M[A[i]]=1;
        overlap_count=0;
        overlap_bytes=0;
        for (i=2;i<=n2;i++) {
            if (M[B[i]] == 1) {
                overlap_count++;
                overlap_bytes+=S[i];
            }
        }
        if (n1 == 0) frac_docs = 0; else frac_docs = overlap_count/n1*100;
        if (TS == 0) frac_bytes = 0; else frac_bytes = overlap_bytes/TS*100;
        printf "%3d %5.2f%% %6d %5.2f%% \n", overlap_count, frac_docs, overlap_bytes, frac_bytes;
    }
    prev=$0
}' | awk -v B=${1-5} '
{ N[int($2/B)]++; M[int($4/B)]++ }
END {
    print "Overlap% Docs Bytes";
    for (i=0;i<=100/B;i++) {
        if (i in N) n=N[i]; else n=0;
        if (i in M) m=M[i]; else m=0;
        printf "%7d%% %4d %5d\n", i*B, n, m
    }
}'

