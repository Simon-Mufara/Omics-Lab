#!/usr/bin/env bash
# OmicsLab Codespace Setup — installs a complete bioinformatics environment
# Estimated time: 8-12 minutes on first launch

set -euo pipefail

echo "════════════════════════════════════════════════════"
echo "  OmicsLab Bioinformatics Environment Setup"
echo "  Powered by conda/mamba + bioconda"
echo "════════════════════════════════════════════════════"

# ─── 1. Bootstrap mamba ───────────────────────────────
echo "[1/5] Installing mamba (faster conda)..."
conda install -y -n base -c conda-forge mamba
mamba init bash
source ~/.bashrc 2>/dev/null || true

# ─── 2. Create bioinformatics environment ─────────────
echo "[2/5] Creating 'bioinformatics' conda environment..."
mamba create -y -n bioinformatics -c conda-forge -c bioconda \
  python=3.11 \
  fastqc=0.12.1 \
  fastp=0.23.4 \
  bwa=0.7.18 \
  bwa-mem2=2.2.1 \
  samtools=1.19 \
  picard=3.1.0 \
  gatk4=4.5.0.0 \
  star=2.7.11b \
  salmon=1.10.2 \
  hisat2=2.2.1 \
  subread=2.0.6 \
  trim-galore=0.6.10 \
  bcftools=1.19 \
  multiqc=1.21 \
  kraken2=2.1.3 \
  bracken=2.9 \
  snakemake=8.4.6 \
  nextflow=23.10.1 \
  bedtools=2.31.1 \
  deeptools=3.5.4 \
  r-base=4.3.2 \
  bioconductor-deseq2 \
  bioconductor-edger \
  bioconductor-limma \
  r-ggplot2 \
  r-tidyverse \
  jupyterlab \
  pandas \
  numpy \
  scipy \
  matplotlib \
  seaborn \
  biopython

# ─── 3. Install VEP (Ensembl) ─────────────────────────
echo "[3/5] Installing Ensembl VEP..."
mamba install -y -n bioinformatics -c bioconda ensembl-vep

# ─── 4. Create workspace structure ────────────────────
echo "[4/5] Creating workspace..."
mkdir -p ~/workspace/{data,results,scripts,notebooks,logs}

# Sample script files
cat > ~/workspace/scripts/wgs_pipeline.sh << 'EOF'
#!/usr/bin/env bash
# WGS Analysis Pipeline — OmicsLab
# Usage: bash scripts/wgs_pipeline.sh <sample_name>

set -euo pipefail

SAMPLE="${1:-sample}"
REF="data/reference.fa"
THREADS="${SLURM_CPUS_PER_TASK:-8}"
OUT="results/${SAMPLE}"
mkdir -p "$OUT"

echo "Starting WGS pipeline for: $SAMPLE"

# FastQC
fastqc "data/${SAMPLE}_R1.fastq.gz" "data/${SAMPLE}_R2.fastq.gz" -o "$OUT/" -t "$THREADS"

# Fastp trim
fastp -i "data/${SAMPLE}_R1.fastq.gz" -I "data/${SAMPLE}_R2.fastq.gz" \
  -o "$OUT/trimmed_R1.fastq.gz" -O "$OUT/trimmed_R2.fastq.gz" \
  --json "$OUT/fastp.json" --html "$OUT/fastp.html" -w "$THREADS"

# BWA-MEM2 align
bwa-mem2 mem -t "$THREADS" "$REF" \
  "$OUT/trimmed_R1.fastq.gz" "$OUT/trimmed_R2.fastq.gz" | \
  samtools sort -@ "$THREADS" -o "$OUT/aligned.bam"
samtools index "$OUT/aligned.bam"

# MarkDuplicates
picard MarkDuplicates \
  I="$OUT/aligned.bam" O="$OUT/dedup.bam" M="$OUT/dup_metrics.txt"
samtools index "$OUT/dedup.bam"

# BQSR
gatk BaseRecalibrator \
  -I "$OUT/dedup.bam" -R "$REF" \
  --known-sites data/dbsnp.vcf.gz \
  -O "$OUT/recal.table"
gatk ApplyBQSR \
  -I "$OUT/dedup.bam" -R "$REF" \
  --bqsr-recal-file "$OUT/recal.table" \
  -O "$OUT/recal.bam"

# Variant calling
gatk HaplotypeCaller \
  -R "$REF" -I "$OUT/recal.bam" \
  -O "$OUT/raw.vcf.gz" \
  --emit-ref-confidence GVCF

# MultiQC
multiqc "$OUT/" -o "$OUT/multiqc/"

echo "Done! Results in $OUT/"
EOF
chmod +x ~/workspace/scripts/wgs_pipeline.sh

# Snakefile
cat > ~/workspace/Snakefile << 'EOF'
# Snakemake WGS Workflow — OmicsLab
# Run: conda activate bioinformatics && snakemake -j 8 --use-conda

SAMPLES = ["sample1", "sample2"]

rule all:
    input:
        expand("results/{sample}/multiqc/multiqc_report.html", sample=SAMPLES)

include: "rules/qc.smk"
include: "rules/align.smk"
include: "rules/variants.smk"
include: "rules/report.smk"
EOF

# ─── 5. Start JupyterLab ──────────────────────────────
echo "[5/5] Setup complete!"
echo ""
echo "════════════════════════════════════════════════════"
echo "  ✅ OmicsLab environment is ready!"
echo ""
echo "  Activate:  conda activate bioinformatics"
echo "  JupyterLab: jupyter lab --ip=0.0.0.0 --port=8888"
echo "  Web preview: python -m http.server 3000"
echo ""
echo "  Quick start:"
echo "    conda activate bioinformatics"
echo "    cd workspace"
echo "    bash scripts/wgs_pipeline.sh my_sample"
echo "════════════════════════════════════════════════════"
