/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Curriculum Learning Paths
   Structured tracks with progress tracking, prerequisites,
   next-lesson flow, and completion triggers for the badge system.
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Curriculum = (function () {

  const STORE_KEY = 'omicslab_curriculum_v1';

  /* ─── Track definitions ─── */
  const TRACKS = {
    foundations: {
      id: 'foundations',
      icon: 'terminal',
      title: 'Foundations',
      subtitle: 'Computing for omics — start here',
      color: '#e3b341',
      recommended: true,
      audience: 'Anyone with zero prior Linux, Python, or Jupyter experience',
      outcome: 'Navigate a Linux terminal, read and predict basic Python, and understand what a Jupyter Notebook actually is — the baseline every other track assumes you already have.',
      badge: 'foundations-certified',
      lessons: [
        {
          id: 'f-01', title: 'What is Linux? Why bioinformatics lives in the terminal', duration: '15 min', icon: 'terminal',
          why: 'Almost every real genomics tool — GATK, samtools, BWA, the pipelines H3ABioNet trains on — only ships for Linux, never as a Windows program you double-click. A wet-lab scientist who can\'t use a terminal hits a hard wall the moment they need to run their own analysis instead of outsourcing it.',
          prereq: null,
          concepts: [
            { name: 'What an operating system actually is', body: 'Windows, macOS, and Linux are all just different programs that manage your computer\'s hardware and let other programs run. Servers and HPC clusters almost universally run Linux because it\'s free, open-source, and built to be controlled entirely by typed commands — no license fee per machine, and every step can be scripted and repeated exactly.', analogy: 'Think of it like choosing between three kitchens to cook in — same ingredients, same physics, but very different layouts and tools within reach.' },
            { name: 'The filesystem as a tree', body: 'Every file and folder on a Linux system sits somewhere in one single tree starting at "/" (the root). A path like /home/simon/data/sample.fastq is just directions down that tree, folder by folder.', analogy: 'Like a postal address written from country down to street number — most specific detail last.' },
            { name: 'The terminal is a conversation, not a black box', body: 'A terminal just lets you type one instruction at a time and see the exact result. It isn\'t smarter or more dangerous than clicking a button — it\'s just more literal. It does precisely what you typed, not what you meant.', analogy: 'Like a very literal-minded assistant: ask for "the red folder" and it opens exactly the one named "red," not the one that happens to look reddish.' },
          ],
          theory: 'When you press Enter, the shell (the program reading your typed line) splits it into a command name and arguments, searches a list of folders called PATH for a matching program, and hands control to it. The program runs, prints its result, and control returns to the shell. This is why bioinformatics tools are usually just single-word commands (samtools, bwa, gatk) — they\'re programs sitting somewhere on PATH, exactly like ls or cd.',
          worked: 'Open OmicsLab\'s Terminal tool and try three commands: <code>pwd</code> (print working directory — shows exactly where you are in the tree), <code>ls</code> (list what\'s in the current folder), and <code>cd data</code> (move into a folder called "data"). Each one does exactly what its name suggests — nothing more mysterious than that.',
          tryItTool: { mode: 'terminal', label: 'Open the real Terminal' },
          terms: [
            { term: 'Shell', def: 'The program that reads what you type and runs the matching command.' },
            { term: 'Terminal', def: 'The window you type into — the shell runs inside it.' },
            { term: 'Filesystem', def: 'The single tree structure holding every file and folder on the system.' },
            { term: 'Path', def: 'Directions to a file or folder, either absolute (from /) or relative (from where you currently are).' },
          ],
          misconceptions: [
            { claim: '"Linux is only for hackers and computer science experts."', correction: 'A terminal is just a different, more precise input method than clicking — not a sign of expertise. Everything in this lesson is typeable by a complete beginner in one sitting.' },
            { claim: '"One wrong command will destroy my whole computer."', correction: 'Overstated — the vast majority of commands (including everything in this Foundations track) only read or list things. A small number of commands (like rm) can delete without asking twice, which is why later lessons flag those specifically rather than treating every command as equally risky.' },
          ],
          summary: [
            'An operating system manages hardware and runs other programs; Linux dominates servers and HPC clusters because it\'s free, open-source, and fully scriptable.',
            'Every file and folder lives in one tree starting at "/" — a path is just directions through that tree.',
            'The terminal executes exactly what you type, one line at a time — it\'s literal, not intelligent or intuitive.',
            'A shell splits your typed line into a command name plus arguments and finds the matching program on PATH.',
            'pwd, ls, and cd are your three most-used first commands: where am I, what\'s here, and move there.',
          ],
          quiz: [
            { q: 'You type "pwd" and see /home/simon/data. What does this tell you?', options: ['The names of files inside the data folder', 'Your exact current location in the filesystem tree', 'A list of every folder on the computer', 'An error — pwd is not a real command'], correct: 1, explain: 'pwd = "print working directory" — it shows exactly where you currently are, nothing else.' },
            { q: 'Why do most bioinformatics tools (GATK, samtools, BWA) only run on Linux?', options: ['Linux is faster at every task than other systems', 'HPC clusters and servers overwhelmingly run Linux, so tools are built and tested for it first', 'Windows cannot run any scientific software', 'It\'s a licensing requirement from the tool authors'], correct: 1, explain: 'It\'s about the ecosystem these tools were built for — servers and clusters run Linux, so that\'s the primary (often only) target.' },
            { q: 'A path is written as data/sample.fastq (no leading slash). What kind of path is this?', options: ['Absolute, starting from root', 'Relative, starting from wherever you currently are', 'Invalid — all paths must start with /', 'A Windows-style path'], correct: 1, explain: 'No leading "/" means it\'s relative — directions starting from your current location, not from the root of the tree.' },
          ],
        },
        {
          id: 'f-02', title: 'Essential commands & piping data', duration: '20 min', icon: 'link',
          why: 'A single FASTQ file for one sample can be several gigabytes — there is no double-clicking that open in a text editor. Every bioinformatician\'s daily workflow runs on commands like peeking inside a huge file instantly, without ever loading the whole thing.',
          prereq: 'f-01',
          concepts: [
            { name: 'grep — searching text without opening the file', body: 'grep scans a file line by line and prints only the lines matching a pattern you give it. Searching a 5GB file this way takes seconds and never loads more than one line into memory at a time.', analogy: 'Like using Ctrl+F on a document too large to ever fully open.' },
            { name: 'head and tail — peeking at big files', body: 'head shows just the first lines of a file, tail shows just the last. Both let you sanity-check a huge file\'s format in under a second.', analogy: 'Like reading the first and last page of a very long report to check it\'s the right document before committing to reading it all.' },
            { name: 'The pipe ( | ) — chaining commands together', body: 'The pipe symbol sends one command\'s output directly into the next command\'s input, with no file saved in between. This is how real pipelines are built: several small, well-understood commands chained into one precise operation.', analogy: 'Like a factory assembly line — each station\'s output becomes the next station\'s input, with nothing set down in between.' },
          ],
          theory: 'A pipe works at the operating-system level: the shell connects the first program\'s stdout (standard output) directly to the second program\'s stdin (standard input) as a stream. Neither program needs to know the other exists, and — critically for genomics — the data never has to be fully written to disk or fully loaded into memory. This is exactly why `zcat huge_file.fastq.gz | head` can instantly peek inside a multi-gigabyte compressed file: it decompresses and reads only as much as head asks for, then stops.',
          worked: 'In the Terminal tool, try <code>grep "^>" sequences.fasta | head -5</code> — this finds every line starting with ">" (a FASTA header) and shows only the first 5 matches. You\'ve just listed the first 5 sequence names in a file without opening it, using two commands chained together.',
          tryItTool: { mode: 'terminal', label: 'Open the real Terminal' },
          terms: [
            { term: 'grep', def: 'Searches text for lines matching a pattern.' },
            { term: 'Pipe ( | )', def: 'Connects one command\'s output directly to the next command\'s input.' },
            { term: 'Redirect ( > )', def: 'Saves a command\'s output to a file instead of printing it to the screen.' },
            { term: 'stdout / stdin', def: 'The standard channels a program prints to (stdout) and reads from (stdin) by default.' },
          ],
          misconceptions: [
            { claim: '"I need to see the whole file to understand what\'s in it."', correction: 'The opposite is true in practice — head, tail, and grep exist precisely so you never have to load an entire multi-gigabyte file just to check its format or search it.' },
            { claim: '"Piping commands together is an advanced trick I can learn later."', correction: 'It\'s used in nearly every real one-line bioinformatics command you\'ll ever run — this is core vocabulary, not an optional shortcut.' },
          ],
          summary: [
            'grep searches text for a pattern without ever opening the file in an editor.',
            'head and tail let you sanity-check a huge file\'s format in under a second.',
            'The pipe ( | ) sends one command\'s output straight into the next command\'s input — no file saved in between.',
            'Pipes work by connecting stdout to stdin at the OS level, which is why they handle huge files instantly.',
            'Real pipelines are usually several small, well-understood commands chained together, not one giant program.',
          ],
          quiz: [
            { q: 'What does `grep "^>" file.fasta` find?', options: ['Every line in the file', 'Only lines that start with ">"', 'Only lines that end with ">"', 'The file\'s total line count'], correct: 1, explain: 'The ^ means "start of line," so this matches only lines beginning with ">" — FASTA header lines.' },
            { q: 'Why can `zcat huge.fastq.gz | head` show output instantly even for a 5GB file?', options: ['It secretly downloads a smaller cached version', 'The pipe streams data — head stops reading as soon as it has enough lines, so the rest is never processed', 'gzip files are always small', 'It only works on files under 1MB'], correct: 1, explain: 'Piping is a stream — head only pulls as much as it needs, so the full file is never decompressed or loaded.' },
            { q: 'You want to save a command\'s output into a file called results.txt instead of seeing it on screen. What do you use?', options: ['A pipe ( | )', 'grep', 'A redirect ( > )', 'cd'], correct: 2, explain: '> redirects output into a file; | connects two commands together — different jobs.' },
          ],
        },
        {
          id: 'f-03', title: 'What is Python, and why bioinformaticians use it', duration: '20 min', icon: 'code',
          why: 'A researcher limited to point-and-click tools hits a hard ceiling: you cannot reliably repeat "click through this menu" 200 times for 200 samples. A five-line Python script processes 200 or 200,000 samples identically — which is exactly why Biopython appears in such a large share of published African genomics work.',
          prereq: 'f-01',
          concepts: [
            { name: 'Variables — labelled boxes holding a value', body: 'A variable is just a name you choose that points to a value — a sequence, a number, a list of sample names. Writing `sample_count = 200` creates a box named sample_count holding the value 200.', analogy: 'Like a labelled jar in a lab — the label (variable name) doesn\'t change, but what\'s inside it can.' },
            { name: 'Data types that matter for omics', body: 'Strings hold text (a DNA sequence is just a string of letters). Lists hold ordered collections (a list of sample IDs). Dictionaries hold lookups (a gene name pointing to its expression value). Almost every real script is built from just these three.', analogy: 'A string is a sentence, a list is a numbered shopping list, a dictionary is an index at the back of a book — look up a word, get a page number.' },
            { name: 'Functions — reusable instruction blocks', body: 'A function is a named block of steps you can run again and again with different inputs, instead of retyping the same steps every time.', analogy: 'Like a named sub-recipe inside a cookbook — "make the base sauce" — that several other recipes call by name instead of re-explaining every time.' },
          ],
          theory: 'Python is interpreted, not compiled: the interpreter reads and runs your code one line at a time, top to bottom, rather than translating the whole program into machine code before running any of it. This is exactly what makes it good for exploratory analysis — you can run one line, see the real result, then decide the next line, instead of writing an entire program blind. Python\'s dominance in bioinformatics specifically comes from readable syntax plus a huge scientific ecosystem (Biopython, pandas, numpy) built on top of it — much of that ecosystem is actually fast C code underneath, with Python as the readable layer on top.',
          worked: 'A short real script: <code>seq = "ATGCGTACGTTAGC"<br>gc_count = seq.count("G") + seq.count("C")<br>gc_percent = gc_count / len(seq) * 100<br>print(gc_percent)</code> — line 1 creates a variable holding a DNA sequence as a string; line 2 counts G and C bases; line 3 calculates the percentage; line 4 prints the result. Nothing here is more complex than arithmetic with labelled boxes. Type it yourself in the Python Notebook tool — it runs real Python (via Pyodide), not a simulation.',
          tryItTool: { mode: 'notebook', label: 'Open the real Python Notebook' },
          terms: [
            { term: 'Variable', def: 'A name pointing to a value, which can change.' },
            { term: 'String', def: 'A piece of text — DNA/protein sequences are represented as strings.' },
            { term: 'List', def: 'An ordered collection of values.' },
            { term: 'Dictionary', def: 'A lookup structure mapping a key (like a gene name) to a value.' },
            { term: 'Function', def: 'A named, reusable block of instructions.' },
            { term: 'Interpreter', def: 'The program that reads and runs Python code one line at a time.' },
          ],
          misconceptions: [
            { claim: '"You need a computer science degree to write useful Python."', correction: 'Most real bioinformatics scripts are short and pattern-based — reading a file, counting something, filtering rows. The worked example above is genuinely representative of a large share of real day-to-day scripts.' },
            { claim: '"Python is just for beginners — real, serious tools use faster languages."', correction: 'Partly backwards: Python glues together fast C/C++ libraries (numpy, pandas) so you get both readability and speed. It dominates because of this ecosystem, not despite using "just" Python.' },
          ],
          summary: [
            'A variable is a name pointing to a value — the name stays, the value can change.',
            'Strings, lists, and dictionaries cover the vast majority of real omics data-handling needs.',
            'Functions let you write a set of steps once and reuse it with different inputs.',
            'Python is interpreted line-by-line, which is exactly why it suits interactive, exploratory analysis.',
            'Python\'s dominance in bioinformatics comes from readability plus an ecosystem (Biopython, pandas, numpy) built on fast underlying code.',
          ],
          quiz: [
            { q: 'What will `seq.count("G")` return if seq = "ATGCGTACGTTAGC"?', options: ['The position of the first G', 'The total number of times "G" appears in the string', 'True or False', 'An error — count() is not a real method'], correct: 1, explain: '.count() returns how many times the given value appears — here, how many G characters are in the string.' },
            { q: 'You need to store the names of 50 samples in order. What data type fits best?', options: ['A single string', 'A dictionary', 'A list', 'A function'], correct: 2, explain: 'A list holds an ordered collection — exactly what 50 sample names in sequence need.' },
            { q: 'Why does Python\'s line-by-line (interpreted) execution suit exploratory data analysis?', options: ['It makes Python run faster than any compiled language', 'You can run one line, see the real result immediately, then decide your next step', 'It prevents all possible errors', 'It only works inside Jupyter Notebooks'], correct: 1, explain: 'Interpreted execution means you get immediate, real feedback per line — ideal for exploring data step by step rather than writing blind.' },
          ],
        },
        {
          id: 'f-04', title: 'Jupyter Notebooks — where real analysis happens', duration: '15 min', icon: 'file-text',
          why: 'Every real published bioinformatics analysis — a malaria drug-resistance study, a TB outbreak investigation — is written up as a notebook, not a slideshow, because reviewers and collaborators need to see the actual code sitting right next to its actual output, reproducibly.',
          prereq: 'f-03',
          concepts: [
            { name: 'Cells: code vs. markdown', body: 'A notebook is a sequence of cells. A code cell runs Python and shows its output directly underneath. A markdown cell holds formatted text — explaining what the next code cell does and why — interleaved with the code itself.', analogy: 'Like a lab notebook where each entry is either "here\'s what I did" (code) or "here\'s why I did it" (notes) — except this one actually re-runs the experiment for you.' },
            { name: 'Execution order, not page order', body: 'Cells can be run in any order you choose, and each run remembers variables from cells run before it — regardless of where those cells sit on the page. This is powerful, and it is also the single most common source of confusing notebook bugs.', analogy: 'Like a recipe where you can cook the steps out of order — powerful, but if you plate the dish before adding the sauce, don\'t be surprised it looks wrong.' },
          ],
          theory: 'Behind every running notebook is a kernel — a live Python process holding every variable and import you\'ve executed so far. When you run a cell, its code executes against that live kernel\'s current state, not against a "clean slate" each time. This is why the true test of a reproducible notebook isn\'t "does it look finished" — it\'s "if I restart the kernel and run every cell top to bottom in order, does it produce the same result with no missing steps." That single check is what separates a real, shareable analysis from one that only worked because of a hidden, out-of-order execution history.',
          worked: 'Picture a real 4-cell notebook: cell 1 imports pandas; cell 2 loads a small variant table into a dataframe; cell 3 filters that table down to one gene of interest; cell 4 plots a bar chart of variant counts by population. Read top to bottom, each cell\'s output (a table preview, then a filtered table, then a chart) sits directly under the code that produced it — exactly the trail a reviewer needs to verify the result themselves.',
          tryItTool: { mode: 'notebook', label: 'Open the real Python Notebook' },
          terms: [
            { term: 'Notebook', def: 'A document mixing code, its output, and narrative text in one file.' },
            { term: 'Cell', def: 'One block of the notebook — either code or markdown/text.' },
            { term: 'Kernel', def: 'The live Python process running behind the notebook, holding all current variables.' },
            { term: 'Reproducibility', def: 'The property that restarting and re-running a notebook top-to-bottom gives the same result.' },
          ],
          misconceptions: [
            { claim: '"Cells run in the order they\'re arranged on the page."', correction: 'They run in whatever order you personally execute them — which is exactly why restart-and-run-all is the real test, not scrolling through and eyeballing that it "looks right."' },
            { claim: '"If my notebook looks finished with all outputs showing, it\'s reproducible."', correction: 'Not necessarily — those outputs might only exist because of cells you ran out of order and never re-ran cleanly. Reproducible means someone else can restart the kernel, run all cells in order, and get the same result.' },
          ],
          summary: [
            'A notebook interleaves code cells (that run and show output) with markdown cells (narrative text).',
            'A live kernel holds all current variables — cells run against that live state, not a blank slate.',
            'Cells execute in whatever order YOU run them, which can differ from their order on the page.',
            'The real reproducibility test is restart-the-kernel-and-run-all-in-order, not "it looks finished."',
            'This is why nearly every published genomics analysis today is shared as a notebook, not a static report.',
          ],
          quiz: [
            { q: 'You run cell 3, then cell 1, then cell 2. Does cell 2 have access to variables created in cell 1?', options: ['No — cell 1 ran after cell 2 was written, so it can\'t', 'Yes — the kernel holds whatever has actually been executed, in the order you ran it, regardless of page position', 'Only if you restart the kernel first', 'Notebooks don\'t allow running cells out of order'], correct: 1, explain: 'Execution order (what you\'ve actually run) is what matters, not the cells\' visual order on the page.' },
            { q: 'What is the real test of whether a notebook is reproducible?', options: ['It has no red error text visible anywhere', 'Restarting the kernel and running every cell top-to-bottom produces the same result', 'It was written by an experienced bioinformatician', 'Every cell has a markdown explanation above it'], correct: 1, explain: 'Restart-and-run-all is the only way to confirm the result doesn\'t depend on a hidden, out-of-order execution history.' },
            { q: 'What actually holds a notebook\'s current variables while you work?', options: ['The web browser tab', 'A live process called the kernel', 'The markdown cells', 'A file saved after every keystroke'], correct: 1, explain: 'The kernel is the live Python process behind the scenes — it\'s what "remembers" everything you\'ve run so far.' },
          ],
        },
      ],
    },
    wetlab: {
      id: 'wetlab',
      icon: 'microscope',
      title: 'Wet-Lab Scientist',
      subtitle: 'From sample to sequencer',
      color: '#00C4A0',
      audience: 'Lab technicians, biomedical scientists, sample handlers',
      outcome: 'Understand every bench step of an omics experiment and how to maximise data quality before sequencing.',
      badge: 'wetlab-certified',
      capstone: { workflowId: 'wgs', minScore: 80, label: 'Run the Whole Genome Sequencing lab simulation and score 80+', desc: 'Every bench decision in this track — sample integrity, extraction, library prep, platform choice — shows up in this one real, graded run.' },
      lessons: [
        {
          id: 'wl-01', title: 'Sample Collection & Integrity', duration: '15 min', icon: 'droplet',
          why: 'A sample that quietly degrades in transit between a rural clinic and a sequencing lab doesn\'t produce "slightly worse" data — the resulting low integrity score can silently undermine an entire TB or malaria surveillance result, long before anyone runs a single bioinformatics tool.',
          prereq: null,
          concepts: [
            { name: 'RIN and DIN scores', body: 'RNA Integrity Number (RIN) and DNA Integrity Number (DIN) are both scored 1–10, measured by running a small amount of your sample through capillary electrophoresis and checking how intact it still is. Below about 6–7, most downstream protocols start failing or producing biased results.', analogy: 'Like checking a rope for fraying before trusting your weight to it — a score tells you how much tension the material can actually take before it snaps somewhere you didn\'t expect.' },
            { name: 'Cold chain', body: 'Nucleases — enzymes naturally present in blood and tissue — start breaking down DNA/RNA the moment a cell dies or is disturbed. Keeping a sample cold from the moment of collection to the moment of extraction slows that process dramatically.', analogy: 'Like keeping meat refrigerated — the biology doesn\'t stop, it just slows down enough that it doesn\'t ruin the sample before you get to use it.' },
            { name: 'Africa-specific transport realities', body: 'A -80°C freezer is easy to promise and hard to guarantee across a multi-hour transport route with inconsistent power. Real field protocols plan for this explicitly — dry ice logistics, RNA-stabilising reagents that don\'t need constant freezing, and realistic time budgets — rather than assuming ideal cold-chain conditions that may not exist end to end.' },
          ],
          theory: 'Nucleases are always present in biological material and become active as soon as a cell is lysed or dies — they don\'t need to be "added," they\'re already there. Cold temperature doesn\'t stop this chemistry, it slows the reaction rate dramatically (as with almost all biochemistry). RIN/DIN scoring works by measuring the ratio and sharpness of ribosomal RNA peaks (for RIN) or the presence of a clean high-molecular-weight DNA band versus a smear of degraded fragments (for DIN) on an electrophoresis trace — a quantitative stand-in for "how much nuclease damage has already happened."',
          worked: 'In OmicsLab\'s lab simulation, select a field-collected blood sample and choose "no cold storage available" for the transport step — watch the DIN reading drop before you\'ve even reached the extraction bench. Now restart and choose proper cold-chain transport instead: the same sample keeps a DIN in the high 8s–9s all the way to extraction.',
          terms: [
            { term: 'RIN', def: 'RNA Integrity Number (1–10) — how intact an RNA sample still is.' },
            { term: 'DIN', def: 'DNA Integrity Number (1–10) — the DNA equivalent of RIN.' },
            { term: 'Nuclease', def: 'An enzyme that breaks down DNA or RNA; naturally present in biological samples.' },
            { term: 'Cold chain', def: 'Maintaining a controlled low temperature continuously from collection to processing.' },
          ],
          misconceptions: [
            { claim: '"A sample either works or it doesn\'t — pass or fail."', correction: 'It\'s a graded spectrum, not binary. A DIN of 7 might be perfectly fine for a robust WGS protocol but unusable for a sensitive RNA-seq experiment — the "right" threshold depends on what you\'re about to do with it.' },
            { claim: '"Once I froze it, my sample was safe indefinitely."', correction: 'Repeated freeze-thaw cycles cause their own mechanical damage to nucleic acids, independent of nuclease activity — freezing helps, but isn\'t a one-time fix you can ignore afterward.' },
          ],
          summary: [
            'RIN and DIN (1–10) quantify how intact RNA or DNA still is, measured via electrophoresis.',
            'Nucleases are always present in biological material and start degrading samples the moment cells are disturbed or die.',
            'Cold storage slows nuclease activity — it doesn\'t stop biology, it slows its rate dramatically.',
            'Real African field logistics need explicit cold-chain planning, not an assumption of ideal conditions.',
            'Sample quality is graded, and the acceptable threshold depends on which downstream protocol you\'re running.',
          ],
          quiz: [
            { q: 'A DIN score is measured as:', options: ['A pass/fail flag from the sequencer', 'A 1–10 score from electrophoresis showing how intact the DNA still is', 'The concentration of DNA in nanograms', 'The number of freeze-thaw cycles a sample has survived'], correct: 1, explain: 'DIN is a graded 1–10 integrity score derived from an electrophoresis trace, not a simple pass/fail.' },
            { q: 'Why does keeping a sample cold help preserve it?', options: ['Cold kills any nucleases present', 'It slows down nuclease enzyme activity that is already present in the sample', 'It sterilises the sample completely', 'It has no real effect — only chemical preservatives matter'], correct: 1, explain: 'Nucleases are naturally present; cold slows their reaction rate rather than eliminating them entirely.' },
            { q: 'A sample has DIN 7. What\'s the correct next step?', options: ['Automatically discard it — anything below 10 is unusable', 'Check whether DIN 7 meets the threshold for the SPECIFIC protocol you plan to run', 'Refreeze it repeatedly until the score improves', 'Ignore the score — it doesn\'t affect real results'], correct: 1, explain: 'The acceptable threshold depends on the downstream application — some protocols tolerate DIN 7 fine, others need much higher integrity.' },
          ],
        },
        {
          id: 'wl-02', title: 'DNA & RNA Extraction', duration: '20 min', icon: 'flask',
          why: 'A researcher who applies one extraction protocol to every sample type will get contaminated, unusable DNA from a soil metagenomics sample using a kit built for blood — this exact mismatch is a common, avoidable failure point in real African metagenomics fieldwork.',
          prereq: 'wl-01',
          concepts: [
            { name: 'Phenol-chloroform vs. spin-column extraction', body: 'Phenol-chloroform separates DNA from proteins and lipids by chemical partitioning between liquid phases — high yield and purity, but slow and uses hazardous reagents. Spin columns bind DNA to a silica membrane under specific salt/pH conditions while everything else washes through — much faster and safer, at a modest cost in maximum yield.', analogy: 'Like the difference between hand-panning for gold (slow, thorough) and using a sieve (fast, simpler, catches slightly less).' },
            { name: 'Inhibitors', body: 'Some substances survive extraction and don\'t show up as "less DNA" — they show up later as PCR or sequencing failures. Humic acid from soil and heme from blood are classic examples: they can co-purify with your DNA and then block the enzymes used in every downstream step.', analogy: 'Like sand that survived being washed off vegetables — invisible until it wrecks the blender.' },
            { name: 'Yield vs. purity trade-off', body: 'A more aggressive extraction can pull out more total DNA while also dragging along more contaminants. More DNA is not automatically better if it comes with more inhibitors.' },
          ],
          theory: 'Extraction fundamentally works by lysing (breaking open) cells to release their contents, then separating nucleic acids from proteins, lipids, and cellular debris. Silica-column methods exploit the fact that DNA binds to silica in the presence of high salt and low pH (a chaotropic environment) while other cellular components don\'t — so washing the column removes everything except the bound DNA, which is then released ("eluted") in a low-salt buffer. Purity is commonly checked using absorbance ratios: A260/280 around 1.8 indicates low protein contamination; A260/230 well above 1.8 indicates low contamination from solvents or humic-acid-type organics.',
          worked: 'Compare two extraction results in OmicsLab: a clean spin-column blood extraction (A260/280 ≈ 1.8, healthy yield) versus a soil sample extraction showing a suspiciously low A260/230 ratio — a direct sign of humic acid contamination that will cause downstream PCR to fail even though "DNA was successfully extracted."',
          terms: [
            { term: 'Lysis', def: 'Breaking open a cell to release its contents.' },
            { term: 'Inhibitor', def: 'A substance that survives extraction and blocks downstream enzymatic reactions like PCR.' },
            { term: 'A260/280 ratio', def: 'Absorbance ratio indicating protein contamination; ~1.8 is considered pure DNA.' },
            { term: 'A260/230 ratio', def: 'Absorbance ratio indicating solvent/organic contamination; low values flag a problem.' },
          ],
          misconceptions: [
            { claim: '"More DNA extracted always means a better result."', correction: 'A high yield paired with poor purity ratios will still fail downstream — quantity and quality are separate measurements, and both matter.' },
            { claim: '"One extraction kit works fine for any sample type."', correction: 'Soil, plant tissue, and blood each carry very different contaminants and need different extraction chemistries — a kit optimised for one will often underperform badly on another.' },
          ],
          summary: [
            'Phenol-chloroform trades speed and safety for maximum yield/purity; spin columns trade a little yield for speed and safety.',
            'Inhibitors like humic acid or heme can co-purify with DNA and only reveal themselves in later PCR/sequencing failures.',
            'A260/280 flags protein contamination; A260/230 flags solvent/organic contamination — check both, not just concentration.',
            'A higher yield is not automatically a better result if purity ratios are poor.',
            'Sample type (blood vs. soil vs. plant) should determine extraction chemistry, not a one-size-fits-all default.',
          ],
          quiz: [
            { q: 'A soil DNA extraction shows a low A260/230 ratio. What does this most likely indicate?', options: ['Perfectly pure DNA', 'Humic acid or other organic/solvent contamination', 'Too much DNA was extracted', 'A broken spectrophotometer'], correct: 1, explain: 'Low A260/230 is the classic signature of humic acid or solvent contamination — extremely common in soil extractions.' },
            { q: 'Why might spin-column extraction be preferred over phenol-chloroform in a field lab setting?', options: ['It always yields more DNA', 'It\'s faster and avoids hazardous reagents, at a modest cost to maximum yield', 'Phenol-chloroform doesn\'t actually work on DNA', 'Spin columns require no equipment at all'], correct: 1, explain: 'Spin columns trade a little maximum yield for speed and safety — often the right trade-off outside a fully-equipped lab.' },
            { q: 'A sample shows high DNA concentration but a poor A260/280 ratio. What should you conclude?', options: ['The extraction was fully successful', 'There is likely protein contamination despite the high yield', 'The reading must be a typo', 'A260/280 doesn\'t matter if concentration is high'], correct: 1, explain: 'High concentration and poor purity are independent — this sample likely has protein contamination that will affect downstream steps.' },
          ],
        },
        {
          id: 'wl-03', title: 'Library Preparation', duration: '25 min', icon: 'layers',
          why: 'Two researchers can sequence the exact same DNA and get meaningfully different results purely because of how they built the sequencing library. PCR duplication introduced during library prep — not the sequencer itself — is one of the most common, avoidable reasons sequencing data gets flagged as lower quality, regardless of where in the world it was generated.',
          prereq: 'wl-02',
          concepts: [
            { name: 'Fragmentation', body: 'Sequencers can only read DNA fragments within a certain length window, so long genomic DNA first has to be broken into sequencer-sized pieces — either mechanically (shearing with sound waves) or enzymatically (using enzymes that cut DNA at intervals).' },
            { name: 'Adapter ligation', body: 'Short, synthetic DNA sequences (adapters) are chemically attached to both ends of every fragment. The sequencer\'s flow cell is built to specifically capture these adapters — without them, the sequencer has nothing to grab onto.', analogy: 'Like attaching a standard-sized plug to every cable so they all fit the same socket, regardless of what\'s inside the cable.' },
            { name: 'Size selection', body: 'After fragmentation, a library usually contains a spread of fragment sizes. Size selection keeps only fragments in a target range, which keeps sequencing efficient and consistent.' },
          ],
          theory: 'After adapters are ligated, there usually isn\'t enough starting material to load directly onto a sequencer — so PCR is used to amplify the whole library. This is exactly where duplication gets introduced: every PCR cycle doubles existing molecules rather than creating new unique ones, so too many cycles (often needed when starting DNA amount was low, e.g. from a degraded field sample) means a large share of your final reads are just copies of a smaller set of original fragments, not new information.',
          worked: 'In OmicsLab\'s library-prep bench step, adjust the shearing time and watch the fragment-size distribution chart shift narrower or wider. Then try running the library with too few PCR cycles (get a "library concentration too low" warning) versus too many cycles (final QC shows a high duplication rate) — both are visible, real consequences of the same step.',
          terms: [
            { term: 'Fragmentation', def: 'Breaking long DNA into sequencer-appropriate fragment lengths.' },
            { term: 'Adapter', def: 'A short synthetic sequence ligated to fragment ends so the sequencer can capture and read them.' },
            { term: 'Ligation', def: 'The enzymatic process of chemically joining DNA pieces together — here, adapters onto fragments.' },
            { term: 'Size selection', def: 'Keeping only fragments within a target length range.' },
          ],
          misconceptions: [
            { claim: '"Library prep is just a mechanical formality before the real sequencing step."', correction: 'A large share of real, avoidable sequencing errors and biases are introduced right here — it deserves as much attention as the sequencing run itself, not less.' },
            { claim: '"More PCR cycles just means more data."', correction: 'More cycles means more duplicated copies of the same original molecules, not more unique information — past a certain point you\'re inflating file size, not depth of real coverage.' },
          ],
          summary: [
            'DNA must be fragmented to a sequencer-appropriate size before it can be read.',
            'Adapters are ligated onto fragment ends so the sequencer\'s flow cell can capture and read them.',
            'Size selection keeps the library within a consistent, efficient fragment-length range.',
            'PCR amplifies a library when there isn\'t enough starting material — and is exactly where duplication gets introduced.',
            'Too many PCR cycles inflates duplication, not genuine sequencing depth.',
          ],
          quiz: [
            { q: 'Why are adapters ligated onto DNA fragments before sequencing?', options: ['To make the DNA glow under UV light', 'So the sequencer\'s flow cell has a standard sequence to capture and read from', 'To remove PCR duplicates automatically', 'Adapters are only used for RNA, not DNA'], correct: 1, explain: 'Adapters give every fragment, regardless of its original sequence, a standard end the flow cell is built to capture.' },
            { q: 'A library needed extra PCR cycles because the starting sample amount was low. What\'s the likely downstream consequence?', options: ['No consequence — cycles don\'t affect data quality', 'Higher PCR duplication rate in the final sequencing data', 'The DNA will spontaneously fragment further', 'The adapters will fall off'], correct: 1, explain: 'Extra cycles compensate for low input by amplifying more — but each extra cycle duplicates existing molecules rather than adding new unique ones.' },
            { q: 'What is size selection\'s purpose in library prep?', options: ['To sequence only fragments within a consistent target length range', 'To count how many species are present in a sample', 'To measure sample integrity (DIN/RIN)', 'To remove contaminating proteins'], correct: 0, explain: 'Size selection filters the fragmented library down to a consistent, efficient length range before sequencing.' },
          ],
        },
        {
          id: 'wl-04', title: 'Sequencing Platforms', duration: '20 min', icon: 'zap',
          why: 'Choosing a platform that requires shipping samples to a regional hub with a multi-week turnaround, during an active outbreak investigation, can mean a cluster spreads undetected for weeks — while a portable long-read device can produce an answer in the same clinic within hours. Platform choice is a consequential field decision, not a lab preference.',
          prereq: 'wl-01',
          concepts: [
            { name: 'Short-read vs. long-read sequencing', body: 'Illumina-style short-read sequencing produces very accurate reads, typically 150–300 bases long. Long-read platforms (Oxford Nanopore, PacBio) produce reads thousands of bases long — long enough to span repetitive genome regions short reads can\'t resolve — historically at a higher per-base error rate, though this gap keeps closing.' },
            { name: 'Nanopore field sequencing', body: 'A MinION-class Nanopore device is small enough to run from a laptop, requires no fixed infrastructure, and gives results in real time as the run progresses — making it genuinely suited to outbreak response and remote fieldwork where samples can\'t easily reach a centralised lab in time to matter.' },
            { name: 'The real cost calculation', body: 'A lower "cost per base" is meaningless if the platform\'s fixed infrastructure and turnaround time mean the answer arrives too late to act on, or if shipping/logistics costs dwarf the sequencing cost itself. The right comparison is cost (and time) per useful answer, in your actual setting.' },
          ],
          theory: 'Illumina sequencing-by-synthesis adds one fluorescently-labelled base at a time to millions of clustered DNA fragments and images each cycle — extremely accurate because each base call is directly observed, but capped in read length by how many cycles can be run before signal quality degrades. Nanopore instead threads a single DNA strand through a protein nanopore and measures disruptions in an electrical current as each base passes through, base-calling that signal in real time via software — this allows arbitrarily long reads (limited mainly by how intact the input DNA is) at lower upfront infrastructure cost, with accuracy that depends heavily on base-calling software quality.',
          worked: 'OmicsLab\'s Virtual Lab tool shows a MinION and a NovaSeq side by side with their real specs — compare turnaround time, portability, cost, and read length for a hypothetical rural TB outbreak scenario where samples would otherwise need a 2-week round trip to a regional reference lab.',
          terms: [
            { term: 'Short-read sequencing', def: 'Sequencing producing short (~150–300bp), highly accurate reads — e.g. Illumina.' },
            { term: 'Long-read sequencing', def: 'Sequencing producing much longer reads — e.g. Nanopore, PacBio — able to span repetitive regions.' },
            { term: 'Base-calling', def: 'The process (often software-driven) of converting raw signal into an actual DNA sequence.' },
            { term: 'Turnaround time', def: 'The real-world time from sample collection to usable result — not just instrument run time.' },
          ],
          misconceptions: [
            { claim: '"Long-read sequencing is strictly newer and therefore better than Illumina."', correction: 'It\'s a genuine trade-off (read length vs. raw per-base accuracy and infrastructure needs), not a case of one platform simply superseding the other — the right choice depends on the actual question and setting.' },
            { claim: '"The most expensive platform always gives the best answer."', correction: 'The right platform depends entirely on what question you\'re answering and where — an expensive, highly accurate platform is the wrong choice if its turnaround time makes the answer arrive too late to matter.' },
          ],
          summary: [
            'Short-read (Illumina) sequencing is highly accurate but capped at a few hundred bases per read.',
            'Long-read (Nanopore, PacBio) sequencing spans much longer stretches, historically trading some per-base accuracy for that length.',
            'Nanopore\'s portability and real-time results make it genuinely suited to field outbreak response, not just a lab convenience.',
            'The real cost comparison is cost-and-time-per-useful-answer in your actual setting, not raw cost-per-base.',
            'Platform choice is a consequential decision tied to the clinical or research question, not a fixed "best" default.',
          ],
          quiz: [
            { q: 'Why might a MinION be chosen over a NovaSeq for an active field outbreak investigation?', options: ['MinION produces more accurate reads in every case', 'MinION is portable and gives real-time results without needing to ship samples to a fixed facility', 'NovaSeq cannot sequence pathogen genomes', 'MinION is always cheaper per base'], correct: 1, explain: 'Portability and real-time turnaround — not raw accuracy or cost-per-base — is the deciding advantage in an active field response.' },
            { q: 'What is the fundamental trade-off between short-read and long-read sequencing?', options: ['Short-read is always worse in every way', 'Long reads span repetitive regions short reads can\'t, historically at some cost to per-base accuracy', 'There is no real trade-off — long-read has fully replaced short-read', 'Long-read only works on RNA, not DNA'], correct: 1, explain: 'It\'s a genuine trade-off between read length/repeat-spanning ability and raw per-base accuracy, not a strict improvement in one direction.' },
            { q: 'A lab picks the platform with the lowest cost-per-base, but results take 3 weeks to come back for an urgent clinical case. What did they get wrong?', options: ['Nothing — cost-per-base is the only metric that matters', 'They optimised for the wrong metric — cost-and-time-per-useful-answer was the one that mattered here', 'Cost-per-base is not a real sequencing metric', 'The DNA extraction must have failed'], correct: 1, explain: 'For an urgent case, turnaround time to a usable answer matters far more than raw cost-per-base.' },
          ],
        },
        {
          id: 'wl-05', title: 'QC & Run Metrics — the bench-side check', duration: '15 min', icon: 'bar-chart',
          why: 'A wet-lab scientist who ships a failed sequencing run to the bioinformatics team without checking it first wastes days of a whole team\'s time and expensive reagents. Catching a failed run within minutes, right at the sequencer, saves everyone downstream — this is a same-day bench decision, distinct from (and earlier than) the deeper per-sample QC covered in the Bioinformatician track.',
          prereq: 'wl-04',
          concepts: [
            { name: 'Run-level metrics, not just per-sample', body: 'Before looking at any individual sample\'s data, a sequencer\'s run summary reports whole-run health: cluster density (how much DNA was loaded relative to target), %PF (percentage of clusters passing the instrument\'s own basic quality filter), and %≥Q30 across the whole run.' },
            { name: 'Reading the red flags in five minutes', body: 'A run summary is designed to be checked quickly, before touching any bioinformatics tool — cluster density far above or below target, or %PF well under ~80%, are both immediate signals of a problem worth investigating before proceeding.' },
            { name: 'The re-sequence decision', body: 'Recognising WHOSE problem a bad run-level metric usually is matters: overloaded cluster density or low %PF is typically an instrument-loading problem, meaning a re-run at corrected loading concentration is the fix — not a wasted sample requiring re-extraction from scratch.' },
          ],
          theory: 'Cluster density measures how much library DNA was actually loaded onto the flow cell relative to the instrument\'s target range — overloading causes clusters to physically overlap on the flow cell surface, which the instrument then can\'t reliably distinguish, directly reducing %PF (the percentage of clusters clean enough to pass the sequencer\'s own basic filter). Because this failure mode originates at the loading step (a wet-lab bench decision), not in the sample\'s underlying biology, the correct response is usually to re-run the same library at an adjusted concentration — a same-day fix — rather than treating it as a sample failure requiring a fresh extraction.',
          worked: 'OmicsLab shows a real run summary: cluster density at 210% of target (overloaded) and %PF at 68% (below the ~80% healthy threshold). Walk through recognising this specific combination as a loading problem, and identify a corrected loading concentration for the re-run — versus a different run showing normal density but poor %≥Q30, which instead points toward a reagent or instrument issue.',
          terms: [
            { term: 'Cluster density', def: 'How much library was loaded onto the flow cell relative to the instrument\'s target range.' },
            { term: '%PF (passing filter)', def: 'The percentage of clusters clean enough to pass the sequencer\'s own basic quality filter.' },
            { term: 'Run summary', def: 'The whole-run health report generated before any per-sample analysis begins.' },
          ],
          misconceptions: [
            { claim: '"Any run that finishes and produces a report was successful."', correction: 'A run can complete fully and still be a failed run by cluster density and %PF standards — "it finished" and "it worked" are different claims.' },
            { claim: '"QC is the bioinformatics team\'s job, not mine."', correction: 'Catching a run-level failure at the bench, the same day, is far cheaper in time and reagents than discovering it after the bioinformatics team has already started downstream analysis on bad data.' },
          ],
          summary: [
            'Run-level metrics (cluster density, %PF, %≥Q30) are checked before any individual sample\'s data is examined.',
            'A quick run-summary check, done at the bench, can catch a failed run in minutes.',
            'Overloaded cluster density and low %PF usually point to a loading problem, not a sample problem.',
            'The fix for a loading problem is typically a same-day re-run at corrected concentration, not a fresh extraction.',
            'Catching this at the bench is far cheaper than letting a bad run reach the bioinformatics team first.',
          ],
          quiz: [
            { q: 'A run shows cluster density at 210% of target and %PF at 68%. What does this combination most likely indicate?', options: ['A DNA extraction problem from days earlier', 'An overloaded flow cell — a loading problem at the sequencing bench', 'A perfectly healthy run', 'A problem that can only be fixed by re-extracting the original sample'], correct: 1, explain: 'Overloaded density degrading %PF is the classic signature of a loading problem, fixable with a same-day re-run at corrected concentration.' },
            { q: 'Why check run-level metrics before looking at any individual sample\'s data?', options: ['Per-sample data is never useful', 'A whole-run problem (like overloading) affects every sample at once and is faster to catch first', 'Run-level metrics replace the need for any other QC', 'It\'s only a formality with no real purpose'], correct: 1, explain: 'A run-level problem affects everything downstream at once — catching it first avoids wasting time analysing individually-doomed samples.' },
            { q: 'Who should be checking basic run-level QC metrics before data moves to bioinformatics?', options: ['Only the bioinformatics team, after the fact', 'The wet-lab scientist, at the bench, right after the run completes', 'No one — the sequencer software rejects all bad runs automatically', 'Only the equipment manufacturer'], correct: 1, explain: 'Bench-side checking, immediately after the run, is far cheaper than discovering the same problem after downstream analysis has already begun.' },
          ],
        },
      ],
    },

    bioinformatics: {
      id: 'bioinformatics',
      icon: 'cpu',
      title: 'Bioinformatician',
      subtitle: 'From reads to results',
      color: '#58a6ff',
      audience: 'Bioinformatics students, computational researchers, data analysts',
      outcome: 'Run a complete omics analysis pipeline from raw FASTQ to interpreted variant calls using best-practice tools.',
      badge: 'bioinfo-certified',
      capstone: { workflowId: 'wes', minScore: 80, label: 'Run the Whole Exome Sequencing lab simulation and score 80+', desc: 'A distinct real pipeline run — alignment, variant calling, and QC decisions all feed into one graded result.' },
      lessons: [
        {
          id: 'bi-01', title: 'Linux & HPC Fundamentals', duration: '20 min', icon: 'server',
          why: 'Real cohort-scale African genomics — H3Africa, AWI-Gen, a national TB surveillance dataset — simply does not run on a single laptop. It requires submitting jobs to a shared cluster and waiting your turn in a queue like every other researcher on that system.',
          prereq: 'f-02',
          concepts: [
            { name: 'What an HPC cluster actually is', body: 'A cluster is many networked computers (nodes) sharing storage, with a job scheduler deciding who runs what, when, using which resources — you don\'t get a machine to yourself, you request a slice of one.' },
            { name: 'SLURM basics', body: '`sbatch` submits a job script requesting resources (CPUs, memory, time); `squeue` shows where your job sits in the queue; `scancel` stops it. Submitting a job doesn\'t run it immediately — it queues behind everyone else\'s jobs until matching resources free up.', analogy: 'Like handing your order to a kitchen with one queue for everyone — submitting doesn\'t mean instant cooking, it means you\'re now in line.' },
            { name: 'File transfer at genomics scale', body: '`rsync` (unlike a plain copy) only transfers what has actually changed and can resume an interrupted transfer — essential when moving multi-gigabyte FASTQ files between your machine and cluster storage over an unreliable connection.' },
          ],
          theory: 'A scheduler like SLURM exists because dozens or hundreds of researchers share the same limited hardware. Your job script declares the resources it needs; SLURM places it in a queue and starts it only once those resources are actually free — this is precisely why `sbatch job.sh` returns instantly with a job ID rather than running your analysis right there in the terminal like a local script would.',
          worked: 'In OmicsLab\'s HPC Training tool, submit a script requesting 4 CPUs and 8GB RAM. Watch its state move from PENDING (waiting in the simulated queue) to RUNNING once resources are available — exactly what a real `squeue` check would show you on an actual cluster.',
          terms: [
            { term: 'HPC', def: 'High-Performance Computing — a cluster of networked machines for large-scale jobs.' },
            { term: 'Node', def: 'One machine within the larger cluster.' },
            { term: 'SLURM', def: 'A common job-scheduling system managing who runs what, when, on shared cluster resources.' },
            { term: 'sbatch / squeue / scancel', def: 'Submit a job / check the queue / cancel a job.' },
            { term: 'rsync', def: 'A file-sync tool that transfers only changes and can resume interrupted transfers.' },
          ],
          misconceptions: [
            { claim: '"My job didn\'t run immediately, so something is broken."', correction: 'It\'s almost always queued behind other jobs competing for the same resources — checking `squeue` (or the equivalent status view) will usually show PENDING, not an error.' },
            { claim: '"I can just copy files back and forth like I would on my own laptop."', correction: 'At genomics scale, rsync\'s "only transfer what changed, resume if interrupted" behaviour isn\'t a nice-to-have — a plain copy re-sending an entire multi-gigabyte file after a dropped connection can cost hours.' },
          ],
          summary: [
            'An HPC cluster is many networked nodes sharing storage, governed by a job scheduler.',
            'SLURM\'s sbatch submits a job requesting specific resources; it queues rather than running instantly.',
            'squeue shows your job\'s status in the queue; scancel stops it.',
            'rsync transfers only changed data and can resume interrupted transfers — critical for large genomics files.',
            'A job sitting in PENDING is normal queue behaviour, not a failure.',
          ],
          quiz: [
            { q: 'You run `sbatch job.sh` and it returns instantly with a job ID, but nothing seems to happen yet. What\'s going on?', options: ['The job failed silently', 'The job is queued and will run once matching resources are free — check squeue', 'sbatch only works for test jobs', 'You need to restart the cluster'], correct: 1, explain: 'sbatch submission is instant by design — the job then waits in queue until resources free up, visible via squeue.' },
            { q: 'Why use rsync instead of a plain copy for a 5GB FASTQ file over an unreliable connection?', options: ['rsync is only for text files', 'rsync can resume an interrupted transfer and skips re-sending unchanged data', 'Plain copy is always faster', 'rsync compresses files automatically with no other benefit'], correct: 1, explain: 'Resuming interrupted transfers and skipping unchanged data are exactly the properties that matter at genomics file sizes.' },
            { q: 'What does an HPC job scheduler like SLURM fundamentally manage?', options: ['Which researcher is allowed to log in', 'Which jobs run on the shared hardware, and when, based on requested resources', 'Only file storage quotas', 'Internet access for the cluster'], correct: 1, explain: 'The scheduler\'s core job is arbitrating shared compute resources across many competing job requests.' },
          ],
        },
        {
          id: 'bi-02', title: 'Quality Control — the bioinformatics-tool level', duration: '15 min', icon: 'check-circle',
          why: 'The wet-lab bench check (run-level metrics, checked in minutes right at the sequencer) catches whole-run problems early — but the deeper, per-sample decision about exactly where to trim each read still has to be made here, by looking at the actual FASTQ data, before alignment ever begins.',
          prereq: 'bi-01',
          concepts: [
            { name: 'FastQC per-base quality, revisited at scale', body: 'The same per-base quality decay you\'d check on one sample matters far more once you\'re running 24, 96, or 200 samples in a batch — spotting the 2 outlier samples among many is a different skill than reading one report in isolation.' },
            { name: 'MultiQC — aggregating many reports into one view', body: 'MultiQC scans a whole folder of individual FastQC reports and produces one combined view, making it possible to spot which samples in a large batch are outliers at a glance, instead of opening dozens of reports one at a time.' },
            { name: 'Choosing real trim parameters', body: 'Deciding "trim to 130bp" isn\'t just reading a PASS/WARN/FAIL verdict — it means picking an actual cutting point based on where quality reliably drops across your specific batch, then applying it consistently.' },
          ],
          theory: 'Quality-based trimming tools (like fastp or Trimmomatic) commonly use a sliding window across each read, cutting from the point where average quality within that window drops below a threshold — rather than chopping a fixed number of bases off every read regardless of where decay actually started. This matters because decay onset varies run to run and even sample to sample, so a fixed cut either wastes good bases or leaves bad ones in, depending on the batch.',
          worked: 'OmicsLab\'s pipeline tool shows a MultiQC-style aggregated view across 24 samples in one batch. Two samples stand out with abnormal adapter content compared to the other 22 — decide a shared trim length that handles the batch consistently without over-trimming the 22 healthy samples.',
          terms: [
            { term: 'MultiQC', def: 'A tool that aggregates many individual QC reports (e.g. FastQC) into one combined view.' },
            { term: 'Trimming', def: 'Removing low-confidence bases, usually from the end of a read, before alignment.' },
            { term: 'Sliding window', def: 'A trimming approach that cuts once average quality across a moving window drops below threshold.' },
            { term: 'Batch QC', def: 'Checking quality trends across many samples together, not one at a time.' },
          ],
          misconceptions: [
            { claim: '"Once I\'ve read one sample\'s FastQC report, I understand the whole batch."', correction: 'MultiQC exists precisely because per-sample variation within a batch is common and easy to miss when reports are only checked one at a time.' },
            { claim: '"Trimming a fixed number of bases off every read is good enough."', correction: 'Quality decay onset varies between runs and samples — a sliding-window approach adapts per read, while a fixed cut either wastes good data or leaves bad bases in.' },
          ],
          summary: [
            'MultiQC aggregates many individual FastQC reports into one comparable view across a batch.',
            'Spotting outlier samples within a large batch is a different, additional skill beyond reading one report.',
            'Sliding-window trimming cuts at the point quality actually drops, not a fixed position.',
            'A good trim decision is made at the batch level, applied consistently, not guessed per sample.',
            'This tool-level QC is deeper than — and comes after — the wet-lab bench-side run check.',
          ],
          quiz: [
            { q: 'What problem does MultiQC solve that per-sample FastQC reports alone do not?', options: ['It replaces the need for any quality thresholds', 'It aggregates many reports so outlier samples in a large batch are easy to spot at a glance', 'It automatically fixes bad samples', 'It only works for RNA-seq data'], correct: 1, explain: 'MultiQC\'s value is comparative visibility across many samples at once, not a new quality metric.' },
            { q: 'Why does sliding-window trimming often work better than cutting a fixed number of bases off every read?', options: ['Fixed trimming is always wrong', 'Quality decay onset varies between runs/samples, so a fixed cut over- or under-trims depending on the batch', 'Sliding windows are simpler to compute', 'It only matters for very short reads'], correct: 1, explain: 'Because decay onset varies, an adaptive cut point (sliding window) matches the actual data better than one fixed position for everyone.' },
            { q: 'In a 24-sample batch, 2 samples show abnormal adapter content. What\'s the right response?', options: ['Discard the whole batch', 'Investigate and address those 2 specifically rather than applying an unnecessarily aggressive trim to all 24', 'Ignore it — adapter content never matters', 'Re-extract all 24 samples'], correct: 1, explain: 'Batch-level QC exists to isolate which samples actually need attention, rather than over-correcting the whole batch for a problem in a few.' },
          ],
        },
        {
          id: 'bi-03', title: 'Alignment & Sorting', duration: '25 min', icon: 'dna',
          why: 'A mapping rate that looks fine at 92% can still hide a serious problem — if a disproportionate share of that missing 8% happens to be exactly the reads covering your gene of interest, reference-genome bias against non-European variants can quietly cost you the finding you were looking for.',
          prereq: 'bi-02',
          concepts: [
            { name: 'What alignment actually does', body: 'Alignment finds where each sequenced read most likely came from in a reference genome, allowing for small mismatches and gaps — turning millions of short, unordered fragments into a coordinate-mapped picture of the genome.' },
            { name: 'BWA-MEM2 vs. STAR', body: 'BWA-MEM2 aligns DNA reads directly against the genome. STAR is built for RNA-seq specifically because RNA reads often span two exons that sit far apart in the genome\'s actual DNA sequence — a splice-aware aligner is required to correctly place those "split" reads.' },
            { name: 'Sorting and indexing BAM files', body: 'Reads come off the aligner in essentially arbitrary order. Sorting reorganises them by genomic coordinate, and indexing builds a lookup structure on top of that — together, these let tools like samtools or GATK jump straight to any genomic region instead of scanning the entire file.' },
          ],
          theory: 'BWA-MEM2 uses a pre-built index of the reference genome to rapidly find candidate matching positions for each read, then extends and scores each candidate alignment allowing for small mismatches and indels. STAR additionally detects splice junctions — positions where a read\'s two halves map to two different, often distant, locations in genomic DNA because the intervening intron was already removed at the RNA level — and aligns across them correctly. Sorting reorganises the resulting BAM file by genomic coordinate (not by original read order), which is what allows indexed, efficient region-specific lookups afterward.',
          worked: 'OmicsLab\'s pipeline tool shows a real mapping-rate summary at 92.4% overall — then lets you drill into per-region coverage and find that a disproportionate share of the unmapped 8% clusters around one specific gene region, a concrete illustration of reference bias rather than random noise.',
          terms: [
            { term: 'Alignment', def: 'Finding each read\'s most likely position of origin in a reference genome.' },
            { term: 'BWA-MEM2', def: 'A widely-used DNA aligner.' },
            { term: 'STAR', def: 'A splice-aware RNA-seq aligner that correctly handles reads spanning exon junctions.' },
            { term: 'BAM', def: 'The standard binary format for storing aligned sequencing reads.' },
            { term: 'Coordinate sorting / indexing', def: 'Reorganising and indexing a BAM file by genomic position for fast, targeted lookups.' },
          ],
          misconceptions: [
            { claim: '"A 92% mapping rate is uniformly good news."', correction: 'WHERE the unmapped 8% falls matters enormously — evenly scattered noise is very different from a concentration around one specific region of biological interest.' },
            { claim: '"Any aligner works for any data type."', correction: 'RNA-seq specifically requires a splice-aware aligner (like STAR); using a DNA-only aligner on RNA-seq data will systematically miss or mis-map exon-junction-spanning reads.' },
          ],
          summary: [
            'Alignment maps each read to its most likely genomic position, allowing small mismatches and gaps.',
            'DNA and RNA need different aligners — RNA-seq requires splice-aware alignment across exon junctions.',
            'Sorting reorganises a BAM file by genomic coordinate; indexing then enables fast region-specific lookups.',
            'An aggregate mapping rate can hide a real, localised problem — check WHERE reads fail to map, not just how many.',
            'Reference-genome bias against non-European variation is a real, documented risk in African genomics specifically.',
          ],
          quiz: [
            { q: 'Why does RNA-seq data require a splice-aware aligner like STAR instead of a standard DNA aligner?', options: ['RNA reads are always lower quality', 'RNA reads can span exon junctions that are far apart in genomic DNA, requiring split alignment', 'STAR is simply faster with no functional difference', 'DNA aligners cannot read FASTQ files'], correct: 1, explain: 'Splice-aware alignment is a functional requirement for RNA-seq, not just a speed optimisation — it correctly places reads spanning exon junctions.' },
            { q: 'A sample shows a 92% mapping rate overall. What additional check matters most?', options: ['None — 92% is good enough on its own', 'Whether the unmapped 8% is randomly scattered or concentrated around a specific region of interest', 'Whether the file size is correct', 'The sequencing platform used'], correct: 1, explain: 'The distribution of unmapped reads matters as much as the aggregate percentage — localised gaps can hide a real, consequential problem.' },
            { q: 'What does sorting a BAM file by coordinate enable?', options: ['Faster file compression only', 'Efficient, indexed lookups of any specific genomic region without scanning the whole file', 'Automatic variant calling', 'Removing PCR duplicates automatically'], correct: 1, explain: 'Coordinate sorting (plus indexing) is what allows tools to jump directly to a region of interest instead of reading the entire file sequentially.' },
          ],
        },
        {
          id: 'bi-04', title: 'Variant Calling & Annotation', duration: '30 min', icon: 'microscope',
          why: 'Using the wrong population reference doesn\'t just introduce a small error — a variant that looks rare and concerning against a European-default frequency database can be a common, benign polymorphism in African cohorts, and getting this backwards has real clinical consequences.',
          prereq: 'bi-03',
          concepts: [
            { name: 'What a variant caller actually does', body: 'At each genomic position, a caller compares aligned reads against the reference and decides whether there\'s confident statistical evidence of a real difference — versus sequencing noise that just looks like one.' },
            { name: 'Joint genotyping across a cohort (GVCF workflow)', body: 'Rather than calling each sample\'s variants in isolation, cohort data is typically combined into per-sample GVCFs and then jointly genotyped — pooling evidence across all samples resolves genotypes that would be ambiguous from any one sample alone.' },
            { name: 'Hard filtering vs. VQSR', body: 'Hard filtering applies fixed rule-based thresholds (e.g. minimum quality score) to separate real variants from artifacts. VQSR (Variant Quality Score Recalibration) instead trains a statistical model on known-good variant sites to learn what a real variant "looks like" in this specific dataset — generally more accurate, at the cost of needing a large enough cohort to train on.' },
            { name: 'Population allele frequency context (gnomAD AFR)', body: 'A variant\'s frequency in a population reference database determines whether it reads as common-and-likely-benign or rare-and-potentially-concerning — and that frequency is population-specific, which is exactly why using an African-ancestry reference (gnomAD AFR) instead of a European-default matters clinically.' },
          ],
          theory: 'Modern variant callers like GATK\'s HaplotypeCaller perform local reassembly around each candidate variant site — rebuilding a small local sequence from the reads rather than simply counting base pileups — which correctly resolves nearby SNPs and indels together instead of miscalling them independently. Joint genotyping strengthens this further: a single low-coverage sample might show ambiguous evidence for a genotype alone, but combined with dozens of other cohort samples at the same site, the true genotype often becomes statistically clear. Population allele frequency (from a reference like gnomAD) then provides the clinical context: the same physical mutation can be common and clearly benign in one population\'s reference while appearing rare — and therefore flagged as potentially significant — against a mismatched reference population.',
          worked: 'In OmicsLab\'s Variant Interpreter, paste a real variant and compare its ACMG classification using gnomAD AFR frequency versus a global/European-default frequency — watch the classification shift because the population context genuinely changes the clinical interpretation, not just a display label.',
          terms: [
            { term: 'Variant caller', def: 'Software that identifies confident genomic differences from aligned sequencing reads.' },
            { term: 'GVCF', def: 'A per-sample intermediate format enabling joint genotyping across a cohort.' },
            { term: 'Joint genotyping', def: 'Calling variants using pooled evidence across many samples at once, not one at a time.' },
            { term: 'Hard filtering / VQSR', def: 'Fixed-threshold filtering vs. a trained statistical model for separating real variants from artifacts.' },
            { term: 'Population allele frequency', def: 'How common a variant is in a specific reference population — determines clinical significance context.' },
          ],
          misconceptions: [
            { claim: '"A variant either is or isn\'t a mutation worth flagging, full stop."', correction: 'Population context determines whether a variant reads as common-and-benign or rare-and-concerning — and that context is population-specific, not universal.' },
            { claim: '"One sample\'s genotype can always be called with full confidence in isolation."', correction: 'Joint genotyping across a cohort exists precisely because pooled evidence resolves genotypes that a single sample\'s coverage alone leaves ambiguous.' },
          ],
          summary: [
            'A variant caller distinguishes confident real differences from sequencing noise using local reassembly, not simple pileup counting.',
            'Joint genotyping pools evidence across a cohort, resolving genotypes ambiguous from any single sample alone.',
            'VQSR learns what a real variant looks like from the data itself; hard filtering uses fixed thresholds instead.',
            'A variant\'s allele frequency — and therefore its clinical read — is population-specific.',
            'Using gnomAD AFR instead of a European-default reference can change a variant\'s classification outright, not just its display.',
          ],
          quiz: [
            { q: 'Why does joint genotyping across a cohort improve accuracy compared to calling each sample alone?', options: ['It runs faster, with no accuracy difference', 'Pooled evidence across samples resolves genotypes a single low-coverage sample leaves ambiguous', 'It removes the need for a reference genome', 'It only affects RNA-seq data'], correct: 1, explain: 'The core benefit is statistical — combined evidence across many samples clarifies genotypes individual samples can\'t resolve alone.' },
            { q: 'A variant looks "rare and concerning" against a European-default frequency database but is actually common in African populations. What does this illustrate?', options: ['A sequencing error', 'The importance of using a population-matched reference (like gnomAD AFR) for accurate clinical interpretation', 'That the variant caller is broken', 'That allele frequency never matters for interpretation'], correct: 1, explain: 'This is exactly the real-world risk of reference-population mismatch — the same variant can misclassify entirely depending on which population reference is used.' },
            { q: 'What is the key difference between hard filtering and VQSR?', options: ['They produce identical results always', 'Hard filtering uses fixed thresholds; VQSR trains a statistical model on the dataset\'s own known-good variants', 'VQSR only works on RNA data', 'Hard filtering is always more accurate'], correct: 1, explain: 'VQSR\'s advantage is learning from the actual dataset rather than applying one-size-fits-all fixed thresholds.' },
          ],
        },
        {
          id: 'bi-05', title: 'Workflow Engines & Reproducibility', duration: '20 min', icon: 'rotate-cw',
          why: 'A pipeline that only works because you remember the exact order of fifteen manual commands is not reproducible — it won\'t survive being handed to a labmate, a peer reviewer, or even yourself in six months. Published genomics work increasingly requires a shareable, re-runnable workflow, not a private memory of steps.',
          prereq: 'bi-04',
          concepts: [
            { name: 'Workflow engines (Snakemake, Nextflow)', body: 'Instead of a linear script, a workflow engine lets you declare rules — each with its inputs, outputs, and the command connecting them — and builds a dependency graph (DAG) from them, figuring out execution order itself and re-running only the steps whose inputs actually changed.' },
            { name: 'Containers (Singularity)', body: 'A container packages a tool together with its exact software dependencies and versions, so "it works on my machine" becomes "it works identically anywhere the container runs." Singularity is the HPC-friendly equivalent of Docker, built to run without needing elevated system privileges on shared clusters.' },
            { name: 'Sharing via a reproducibility hub', body: 'Publishing a workflow (not just a methods paragraph) alongside real FAIR/reproducibility scoring lets someone else actually verify your result by re-running it, not just reading a description of what you did.' },
          ],
          theory: 'A Snakemake rule declares its inputs, outputs, and the command producing that output. Snakemake builds a DAG (directed acyclic graph) from all declared rules and only re-executes a step if its declared inputs have changed since the last run — this is what makes re-running a modified pipeline efficient rather than restarting everything from scratch every time. Containers solve a related but distinct problem: freezing exact software versions so a workflow that works today keeps producing the same result in two years, immune to "a dependency silently updated and changed behaviour" drift — one of the most common, quiet causes of irreproducible bioinformatics results.',
          worked: 'In OmicsLab\'s Terminal tool, walk through a small 3-rule Snakemake workflow (align reads → sort BAM → call variants), see the DAG it builds from those declared dependencies, then submit the whole workflow to the simulated SLURM queue as a single job.',
          terms: [
            { term: 'Workflow engine', def: 'Software (e.g. Snakemake, Nextflow) that runs a pipeline based on declared rules and dependencies.' },
            { term: 'DAG', def: 'Directed Acyclic Graph — the dependency structure a workflow engine builds from your rules.' },
            { term: 'Container', def: 'A package bundling a tool with its exact dependencies, ensuring identical behaviour anywhere it runs.' },
            { term: 'Singularity', def: 'A container platform built for HPC clusters, requiring no elevated privileges.' },
          ],
          misconceptions: [
            { claim: '"My analysis is reproducible because I wrote the steps down in a document."', correction: 'A document can go stale or be misread — an executable workflow either runs and produces the same result, or it doesn\'t. Only the latter is a real reproducibility guarantee.' },
            { claim: '"Containers are a web-development concept, not relevant to lab science."', correction: 'They solve exactly the "silently updated tool version changed my results" problem that quietly invalidates a real, significant share of published bioinformatics work.' },
          ],
          summary: [
            'Workflow engines declare rules and their dependencies as a DAG, rather than a fixed linear script.',
            'A DAG lets the engine re-run only the steps whose inputs actually changed, not the whole pipeline.',
            'Containers (e.g. Singularity) freeze exact tool versions so a workflow behaves identically today and years from now.',
            'A written description of your steps is not the same guarantee as an executable, re-runnable workflow.',
            'Publishing a real workflow — not just a methods paragraph — is what lets someone else actually verify your result.',
          ],
          quiz: [
            { q: 'What does a workflow engine\'s DAG actually let it do?', options: ['Run every step from scratch every single time', 'Understand step dependencies so it only re-runs steps whose inputs have changed', 'Automatically write your analysis code for you', 'Replace the need for a reference genome'], correct: 1, explain: 'The DAG\'s core value is efficient, dependency-aware re-execution — not blind full re-runs.' },
            { q: 'Why might a container like Singularity matter for long-term reproducibility?', options: ['It makes analysis run faster with no other benefit', 'It freezes exact tool versions, so results don\'t silently change if a dependency updates later', 'It\'s required for all Linux commands to work', 'It only matters for cloud computing, not HPC'], correct: 1, explain: 'The reproducibility risk it solves is dependency drift — a tool quietly updating and changing behaviour between the original run and a later re-run.' },
            { q: 'Why is a written methods description not equivalent to a real reproducible workflow?', options: ['Written descriptions are always inaccurate', 'A document can go stale or be misread, while an executable workflow either produces the same result or it doesn\'t', 'Methods sections are not allowed in real papers', 'There is no real difference between the two'], correct: 1, explain: 'The distinguishing property of reproducibility is that someone else can actually RUN the analysis and verify the result, not just read about it.' },
          ],
        },
      ],
    },

    publichealth: {
      id: 'publichealth',
      icon: 'globe',
      title: 'Public Health Researcher',
      subtitle: 'From variants to impact',
      color: '#d2a8ff',
      audience: 'Epidemiologists, public health officers, policy researchers',
      outcome: 'Translate genomic findings into disease surveillance insights, policy recommendations, and fundable research proposals.',
      badge: 'pubhealth-certified',
      capstone: { workflowId: 'viral-wgs', minScore: 80, label: 'Run the Viral WGS lab simulation and score 80+', desc: 'The same real-time pathogen sequencing decisions a genomic surveillance response depends on, graded end to end.' },
      lessons: [
        {
          id: 'ph-01', title: 'Genomic Epidemiology Basics', duration: '20 min', icon: 'trending-up',
          why: 'During multi-country Mpox spread across Africa, the gap between a fast, coordinated response and a delayed one often came down to whether genomic data was generated and correctly interpreted quickly enough to reveal real transmission chains — a phylogenetic tree read correctly can flag a superspreading event well before case-count data alone would show it.',
          prereq: null,
          concepts: [
            { name: 'What a phylogenetic tree actually shows', body: 'A tree is a hypothesis of genetic relatedness between sampled pathogen genomes, built from their accumulated differences. Branch length reflects genetic distance (mutations accumulated) — it is not, by itself, a literal timeline.', analogy: 'Like a family tree built purely from DNA similarity — it tells you who\'s closely related to whom, not the exact date of every birth.' },
            { name: 'Nextstrain & outbreak.info', body: 'These are real, widely used public tools that visualise pathogen genomic surveillance data in near-real time, letting researchers and public health officials watch how a pathogen\'s lineages are spreading and evolving as new sequences are deposited.' },
            { name: 'Reading a tree for transmission clusters', body: 'Samples that cluster tightly together with short branch lengths between them suggest a recent, likely shared transmission event; samples on long, separate branches suggest independent introductions rather than local spread from each other.' },
          ],
          theory: 'A phylogenetic tree is built by comparing genomic differences across sampled sequences and inferring the most likely branching pattern that explains those differences (via methods like neighbor-joining or maximum likelihood). Branch length represents genetic distance, not calendar time directly — but for a pathogen with a known, roughly constant mutation rate, genetic distance can be calibrated into an approximate time estimate using a "molecular clock." This is powerful, but it means literal transmission (A infected B) is inferred, not directly observed, from the tree alone.',
          worked: 'In OmicsLab\'s Outbreak Simulator, build a tree from a small set of real-format sequences. Identify which samples cluster tightly (a likely local transmission chain) versus which sit on long, separate branches (likely independent introductions rather than local spread).',
          terms: [
            { term: 'Phylogenetic tree', def: 'A diagram of inferred genetic relatedness/ancestry among sampled genomes.' },
            { term: 'Branch length', def: 'Represents accumulated genetic distance between samples, not calendar time directly.' },
            { term: 'Molecular clock', def: 'A calibration converting genetic distance into an approximate time estimate, using a known mutation rate.' },
            { term: 'Transmission cluster', def: 'A group of samples whose close genetic relatedness suggests a shared, recent transmission event.' },
          ],
          misconceptions: [
            { claim: '"A phylogenetic tree directly shows that person A infected person B."', correction: 'It shows genetic relatedness/ancestry — strong supporting evidence for transmission links, but not direct proof of a specific person-to-person event.' },
            { claim: '"Longer branches always mean more time has passed."', correction: 'Branch length primarily reflects accumulated mutations; converting that into a time estimate requires a calibrated molecular clock and a known, roughly constant mutation rate — it isn\'t automatic.' },
          ],
          summary: [
            'A phylogenetic tree is a hypothesis of genetic relatedness, built from accumulated sequence differences.',
            'Branch length reflects genetic distance, not calendar time directly.',
            'A molecular clock is what converts genetic distance into an approximate time estimate, given a known mutation rate.',
            'Tightly clustered samples with short branches suggest a recent, likely shared transmission event.',
            'Nextstrain and outbreak.info are real, widely-used tools for near-real-time genomic surveillance visualisation.',
          ],
          quiz: [
            { q: 'What does a long branch between two samples on a phylogenetic tree primarily indicate?', options: ['A large amount of calendar time has definitely passed', 'A greater accumulated genetic distance between those samples', 'A laboratory error', 'Nothing — branch length is arbitrary'], correct: 1, explain: 'Branch length reflects genetic distance (accumulated mutations); converting that to calendar time requires a calibrated molecular clock.' },
            { q: 'Two samples cluster very tightly together on a tree with a short branch between them. What does this suggest?', options: ['They are completely unrelated', 'They likely share a recent, common transmission event', 'The sequencing failed for one of them', 'They must be from the same exact patient'], correct: 1, explain: 'Tight clustering with short branch length is the classic signature of a recent, likely shared transmission chain.' },
            { q: 'Why is a phylogenetic tree considered a "hypothesis" of relatedness rather than direct proof of transmission?', options: ['Trees are randomly generated', 'It infers relatedness from genetic similarity; it doesn\'t directly observe who infected whom', 'Trees only work for bacteria, not viruses', 'It always requires patient interviews to build'], correct: 1, explain: 'The tree is inferred from genetic data — a strong evidentiary tool, but inference of relatedness is not the same as directly observed transmission.' },
          ],
        },
        {
          id: 'ph-02', title: 'Disease Surveillance Workflows', duration: '20 min', icon: 'virus',
          why: 'A national health authority does not need to sequence every single case to detect an emerging variant early — real Africa CDC and WHO-aligned surveillance networks are built on a statistical principle that lets a representative subset of cases reveal a rising trend well before exhaustive sequencing would be feasible.',
          prereq: 'ph-01',
          concepts: [
            { name: 'Sentinel site selection', body: 'Rather than attempting to sequence every case everywhere, surveillance programmes select a strategic, representative subset of health facilities to sample from consistently — a statistically sound approach, not a compromise.' },
            { name: 'Variant tracking as a real running example', body: 'SARS-CoV-2 variant surveillance is a concrete, well-documented real-world case of exactly this workflow: consistent sentinel sampling revealing a new variant\'s rising frequency over weeks, well before it became the dominant circulating lineage.' },
            { name: 'Reporting chains', body: 'A local sequencing result flows upward — from the sentinel site, to national health authorities, and onward to global bodies like WHO GOARN — for coordinated situational awareness beyond any single country\'s borders.' },
          ],
          theory: 'Sentinel surveillance rests on the same statistical logic as polling: a representative, consistently-sampled subset of cases can reliably detect an emerging trend — like a new variant\'s rising frequency — without needing to sequence every single case. The key requirement is that sampling stays representative and consistent over time; an inconsistent or biased sentinel network can miss or distort a real trend even while technically "doing surveillance."',
          worked: 'OmicsLab\'s Africa Hub shows a real-style national surveillance dashboard: sentinel site coverage across regions, and a variant\'s frequency curve rising over several months — read the rising curve and identify the point where the new variant would have first crossed a threshold worth flagging to health authorities.',
          terms: [
            { term: 'Sentinel surveillance', def: 'Monitoring disease trends via a representative subset of sites, not exhaustive sampling.' },
            { term: 'GOARN', def: 'WHO\'s Global Outbreak Alert and Response Network, coordinating international outbreak response.' },
            { term: 'Variant of concern', def: 'A pathogen lineage flagged as having concerning properties (transmissibility, severity, immune evasion).' },
            { term: 'Reporting chain', def: 'The path a surveillance finding travels from local detection up to national and global health authorities.' },
          ],
          misconceptions: [
            { claim: '"You need to sequence every single case to detect a new variant."', correction: 'Representative sentinel sampling can reliably detect a rising trend well before exhaustive sequencing would even be logistically feasible.' },
            { claim: '"Surveillance data only matters once an outbreak is already confirmed."', correction: 'The entire point of sentinel surveillance is catching a rise in frequency BEFORE it becomes an obvious, already-established outbreak.' },
          ],
          summary: [
            'Sentinel surveillance samples a representative, consistent subset of sites rather than every case.',
            'This works on the same statistical logic as polling — representativeness matters more than exhaustiveness.',
            'SARS-CoV-2 variant tracking is a real, documented example of this exact workflow succeeding at scale.',
            'Findings flow through a reporting chain from local sites up to national authorities and global bodies like WHO GOARN.',
            'The goal is early detection of a rising trend, not confirmation after the fact.',
          ],
          quiz: [
            { q: 'Why do surveillance programmes use sentinel sites instead of sequencing every case?', options: ['Sequencing every case is impossible in principle', 'A representative, consistent subset can reliably detect a rising trend without exhaustive sampling', 'Sentinel sites are simply cheaper with no statistical justification', 'Only sentinel sites have working sequencers'], correct: 1, explain: 'The statistical logic mirrors polling — representative, consistent sampling reveals trends without needing to sample everyone.' },
            { q: 'What is the biggest risk to a sentinel surveillance network\'s reliability?', options: ['Using too few reagents', 'Inconsistent or non-representative sampling over time, distorting the true trend', 'Sequencing too quickly', 'Reporting results to WHO GOARN'], correct: 1, explain: 'The whole approach depends on staying representative and consistent — losing that undermines the statistical validity of the trend it reveals.' },
            { q: 'What is the primary purpose of catching a rising variant frequency early via sentinel surveillance?', options: ['To confirm an outbreak after it has already peaked', 'To detect and respond to a concerning trend before it becomes an established, widespread outbreak', 'To reduce the total amount of sequencing needed forever', 'It has no practical benefit over waiting for case counts'], correct: 1, explain: 'Early detection — before a trend is obvious from case counts alone — is the entire value proposition of sentinel genomic surveillance.' },
          ],
        },
        {
          id: 'ph-03', title: 'Data Governance & Ethics', duration: '25 min', icon: 'scale',
          why: 'A foreign research team publishing African-collected genomic data without any benefit-sharing agreement or community consultation isn\'t just an ethical lapse — H3Africa\'s data access policy exists specifically because this pattern repeated often enough to demand a real governance framework, and violating it can end a collaboration and damage trust built over years.',
          prereq: null,
          concepts: [
            { name: 'H3Africa data access policy', body: 'A real, existing tiered-access framework requiring genuine local collaboration — not just data extraction — as a condition of accessing H3Africa-generated genomic data.' },
            { name: 'Data sovereignty', body: 'The principle that data about a population should remain under that population\'s (or nation\'s) meaningful control and governance — not simply that it\'s physically stored somewhere, but who genuinely controls access and use decisions.' },
            { name: 'Material Transfer Agreements (MTAs)', body: 'Formal legal documents governing how physical samples or data move between institutions, and explicitly defining what can and can\'t be done with them once transferred.' },
          ],
          theory: 'H3Africa\'s governance model was built specifically in response to a documented history of "helicopter research" — external teams collecting African samples or data, publishing findings without local co-authorship or benefit, then leaving. This is why an MTA review is not bureaucratic friction to route around, but the actual mechanism that protects community and institutional interests — requiring meaningful local partnership as a genuine condition of access, not an optional courtesy.',
          worked: 'In OmicsLab\'s Africa Hub governance section, work through a real-style data access request scenario: decide what access tier is appropriate for the intended use, and identify which community engagement steps must happen before data access is granted, not after.',
          terms: [
            { term: 'H3Africa', def: 'A pan-African genomics research initiative with its own tiered data governance framework.' },
            { term: 'Data sovereignty', def: 'Meaningful control over data by the population/nation it concerns, not just physical storage location.' },
            { term: 'MTA', def: 'Material Transfer Agreement — the legal document governing sample/data transfer and permitted use.' },
            { term: 'Benefit-sharing', def: 'Ensuring the population/institution a sample originated from meaningfully benefits from research using it.' },
          ],
          misconceptions: [
            { claim: '"Data governance rules are just bureaucratic friction slowing down good science."', correction: 'They exist as a direct, deliberate response to real, documented historical harms — not arbitrary red tape unrelated to the science itself.' },
            { claim: '"Once data is deposited in a public repository, governance concerns are resolved."', correction: 'Deposition and appropriate access-tiering/consent are separate questions — some genuinely sensitive data needs controlled, not fully open, access even after deposition.' },
          ],
          summary: [
            'H3Africa\'s tiered data access policy requires genuine local collaboration, not just data extraction.',
            'Data sovereignty is about meaningful control, not just where data happens to be physically stored.',
            'MTAs are the formal legal mechanism defining what can and can\'t be done with transferred samples or data.',
            'This governance model directly responds to a real, documented history of "helicopter research."',
            'Public deposition and appropriate access control/consent are separate, both-necessary questions.',
          ],
          quiz: [
            { q: 'What historical pattern did H3Africa\'s data governance framework specifically respond to?', options: ['Slow internet speeds in African research institutions', '"Helicopter research" — external teams extracting data/samples without local partnership or benefit', 'A shortage of sequencing machines', 'Disagreements over file formats'], correct: 1, explain: 'The framework directly addresses a documented history of external researchers extracting value without genuine local collaboration or benefit.' },
            { q: 'What does "data sovereignty" mean in this context?', options: ['Data must be physically stored within the country of origin', 'The population/nation the data concerns retains meaningful control over its access and use', 'Only government agencies may ever use the data', 'Sovereignty has no practical implication for genomic data'], correct: 1, explain: 'It\'s about who genuinely controls access and use decisions, which is a separate question from physical storage location.' },
            { q: 'A dataset has been deposited in a public repository. Does this alone resolve all data governance obligations?', options: ['Yes, deposition is the final step', 'No — appropriate access tiering, consent, and benefit-sharing are separate ongoing considerations', 'Only if the depositor is African', 'Governance only applies before deposition, never after'], correct: 1, explain: 'Deposition and correct access control/consent are distinct, both-necessary parts of responsible data governance.' },
          ],
        },
        {
          id: 'ph-04', title: 'Communicating Genomic Findings', duration: '15 min', icon: 'globe',
          why: 'A minister who hears "we detected a novel lineage with three non-synonymous spike protein mutations" learns nothing actionable. The same finding translated into "this version may spread faster — here\'s what changes for public gatherings" is what actually shapes policy in time to matter.',
          prereq: 'ph-02',
          concepts: [
            { name: 'Avoiding jargon without losing substance', body: 'Translating technical terms into plain, decision-relevant language means preserving what the finding actually implies for action — not just swapping out big words for smaller ones.' },
            { name: 'Visualisations for non-scientific audiences', body: 'A simple rising-trend line chart communicates a variant\'s spread in seconds to a general audience in a way a phylogenetic tree, however informative to a specialist, cannot.' },
            { name: 'Risk communication during an active outbreak', body: 'Calibrating language to convey genuine uncertainty honestly — avoiding both alarmism and false reassurance — is itself a skill, not a simplification shortcut.' },
          ],
          theory: 'Effective science communication for a policy audience works backward from the decision the finding should inform, not forward from the technical detail itself. The right question isn\'t "how do I simplify this sentence" but "what does this policymaker need to decide, and what\'s the minimum accurate information that genuinely supports that decision" — jargon removal is a side effect of that process, not the goal itself.',
          worked: 'In OmicsLab\'s disease-learning tool, take a real technical variant-of-concern summary and practice translating it into a one-paragraph public health briefing — then check it against a rubric covering jargon, actionability, and honest uncertainty framing.',
          terms: [
            { term: 'Risk communication', def: 'Conveying genuine uncertainty and consequence to a general audience without alarmism or false reassurance.' },
            { term: 'Plain-language translation', def: 'Converting technical findings into language a non-specialist audience can act on.' },
            { term: 'Decision-relevant framing', def: 'Structuring communication around what the audience needs to decide, not just what the finding technically says.' },
          ],
          misconceptions: [
            { claim: '"Simplifying for a non-scientific audience means leaving out the uncertainty."', correction: 'Honestly conveying genuine uncertainty is part of accurate communication, not something to hide in the name of simplicity.' },
            { claim: '"Good science communication is just about avoiding big words."', correction: 'It\'s fundamentally about working backward from the decision the audience needs to make — vocabulary is a downstream detail, not the actual goal.' },
          ],
          summary: [
            'Effective policy communication starts from the decision the finding should inform, not the technical detail itself.',
            'Jargon removal should preserve the finding\'s real implications, not just swap in simpler words.',
            'Simple visualisations (like a trend line) often communicate more to a general audience than a technically richer chart.',
            'Honest uncertainty framing is part of good risk communication, not something simplification should hide.',
            'The same underlying finding can be communicated well or poorly depending entirely on this framing, not the science itself.',
          ],
          quiz: [
            { q: 'What should drive how a genomic finding gets communicated to a policy audience?', options: ['Using the shortest possible sentences', 'The specific decision the audience needs to make, and the minimum accurate information supporting it', 'Removing all numbers and statistics', 'Matching the exact wording of the original scientific paper'], correct: 1, explain: 'Effective communication works backward from the decision at hand, not forward from technical detail or simplicity for its own sake.' },
            { q: 'A briefing for a health minister omits mention of genuine scientific uncertainty to "keep things simple." Is this good practice?', options: ['Yes, uncertainty always confuses policymakers', 'No — honestly conveying real uncertainty is part of accurate communication, not something to hide', 'Only for outbreaks involving more than one country', 'It depends only on the minister\'s personal preference'], correct: 1, explain: 'Hiding genuine uncertainty in the name of simplicity produces inaccurate, not just simplified, communication.' },
            { q: 'Why might a simple trend-line chart communicate more effectively to a general audience than a phylogenetic tree?', options: ['Phylogenetic trees are never useful for anyone', 'A trend line conveys the practical takeaway (rising spread) instantly, without requiring specialist interpretation', 'Trend lines are always more scientifically accurate', 'They contain exactly the same information presented differently'], correct: 1, explain: 'Different visualisations suit different audiences — the trend line\'s advantage here is immediate, specialist-free comprehension of the actionable takeaway.' },
          ],
        },
        {
          id: 'ph-05', title: 'Publishing, Depositing & Sharing Data', duration: '20 min', icon: 'database',
          why: 'A completed, high-quality outbreak investigation that never gets deposited anywhere accessible might as well not have happened, from the perspective of the next research team facing the same pathogen six months later — real impact requires leaving a usable data trail, not just producing a finding.',
          prereq: 'ph-03',
          concepts: [
            { name: 'ENA / SRA submission', body: 'The European Nucleotide Archive and NCBI Sequence Read Archive are real, standard repositories where raw sequencing data is deposited for public or appropriately controlled access — the actual mechanism by which data becomes usable by others at all.' },
            { name: 'Writing a genuinely reproducible methods section', body: 'A methods section is reproducible when it\'s specific enough that someone else could actually repeat the analysis, not just describe it in general terms someone would have to guess the details of.' },
            { name: 'FAIR scoring', body: 'Findable, Accessible, Interoperable, Reusable — a real framework scoring how genuinely usable a shared dataset is to others, evaluated as four separate, checkable properties rather than one binary "is it public" question.' },
          ],
          theory: 'FAIR is not a synonym for "public" — each letter is a distinct, checkable property. Findable means the dataset has a persistent identifier and is actually indexed somewhere discoverable. Accessible means it\'s retrievable via a standard protocol, even if access itself is permissioned rather than fully open. Interoperable means it uses standard formats and vocabularies so other tools can actually read it without custom parsing. Reusable means clear enough metadata, licensing, and provenance exist that someone else can legitimately reuse it. A dataset can be technically public while still scoring poorly across several of these — which is exactly why FAIR scoring evaluates them separately.',
          worked: 'In OmicsLab\'s Reproducibility Hub, submit a mock study and see its FAIR sub-scores broken down individually. Improve one weak sub-score — for example, adding a proper license and richer metadata — and watch the overall score change as a direct, visible consequence.',
          terms: [
            { term: 'ENA / SRA', def: 'European Nucleotide Archive / Sequence Read Archive — standard repositories for depositing raw sequencing data.' },
            { term: 'FAIR', def: 'Findable, Accessible, Interoperable, Reusable — four distinct properties of genuinely usable shared data.' },
            { term: 'Persistent identifier', def: 'A stable, permanent reference (e.g. a DOI or accession number) that makes a dataset findable long-term.' },
            { term: 'Metadata', def: 'Structured information describing a dataset — what it is, how it was generated, and under what terms it can be used.' },
          ],
          misconceptions: [
            { claim: '"Making data public and making it FAIR are the same thing."', correction: 'Public availability alone doesn\'t guarantee a dataset is actually findable, properly formatted, or genuinely reusable by someone else — those are separate, checkable properties.' },
            { claim: '"A methods section written in prose is sufficient for reproducibility."', correction: 'Genuine reproducibility usually requires the actual code or workflow itself, not just a prose description — this connects directly back to the Bioinformatician track\'s workflow-engine lesson.' },
          ],
          summary: [
            'ENA and SRA are the real, standard repositories where raw sequencing data is deposited for others to access.',
            'FAIR breaks "usable shared data" into four separate, checkable properties, not one binary public/private question.',
            'A dataset can be technically public while still scoring poorly on Findability, Interoperability, or Reusability.',
            'A genuinely reproducible methods section is specific enough that someone else could actually repeat the analysis.',
            'Real reproducibility usually requires the actual workflow, not just a prose description of it.',
          ],
          quiz: [
            { q: 'What does the "F" in FAIR (Findable) specifically require?', options: ['The dataset must be free of charge', 'The dataset has a persistent identifier and is indexed somewhere discoverable', 'The dataset must be in English', 'The dataset must be less than 1GB'], correct: 1, explain: 'Findability is specifically about having a stable identifier and being indexed/discoverable — not about cost, language, or size.' },
            { q: 'A dataset is freely public online but uses a custom, undocumented file format with no metadata. How does it likely score on FAIR?', options: ['Perfectly — public means fully FAIR', 'Poorly on Interoperable and Reusable, despite being publicly accessible', 'FAIR doesn\'t apply to public datasets', 'It automatically fails Findable too'], correct: 1, explain: 'Public accessibility doesn\'t guarantee interoperability or reusability — a custom undocumented format with no metadata scores poorly on those specific properties.' },
            { q: 'Why is a prose methods section alone often insufficient for true reproducibility?', options: ['Prose is always inaccurate', 'Someone else usually needs the actual workflow/code to genuinely repeat the analysis, not just a general description', 'Methods sections are optional in real publications', 'Reproducibility only applies to clinical trials'], correct: 1, explain: 'A description can omit or blur exact details a real re-run depends on — the actual executable workflow is what genuinely guarantees repeatability.' },
          ],
        },
      ],
    },
    aiml: {
      id: 'aiml',
      icon: 'cpu',
      title: 'AI & Machine Learning for Omics',
      subtitle: 'How ML actually connects to bioinformatics',
      color: '#bc8cff',
      audience: 'Anyone who has used (or will use) the AI/ML tool and wants to know what it means, not just click through it',
      outcome: 'Explain why ML is used in genomics at all, what a model is actually learning from omics data, when to reach for classical ML vs. a foundation model, and how to read a confusion matrix instead of trusting a headline accuracy number.',
      badge: 'aiml-certified',
      lessons: [
        {
          id: 'aiml-01', title: 'Why does machine learning matter for bioinformatics?', duration: '15 min', icon: 'cpu',
          why: 'A single human exome has ~20,000 genes and can carry tens of thousands of variants; a single scRNA-seq run can profile tens of thousands of cells at once. No hand-written rule book scales to deciding which of those variants is pathogenic or which cell type each cell belongs to — which is exactly the gap ML fills.',
          prereq: null,
          concepts: [
            { name: 'Rules you write vs. patterns a model learns', body: 'Traditional bioinformatics code often runs on rules a person wrote directly — "flag any read with Q-score below 20." Machine learning instead learns its own rule from labeled examples, which matters when the real boundary (e.g. pathogenic vs. benign) is too complex, high-dimensional, or subtle for a human to write down by hand.', analogy: 'Like the difference between memorizing "add 15% tip" and actually learning to judge good service from a thousand past examples of what people tipped and why.' },
            { name: 'Why omics data specifically pushes you toward ML', body: 'Omics datasets are usually both wide (thousands of genes/variants/features per sample) and irregular (batch effects, sequencing noise, population variation) — exactly the conditions where simple thresholds break down but a model trained on many labeled examples can still find the real signal.' },
            { name: 'Where this is already running in this platform', body: 'The Classical ML tab\'s Random Forest example predicts MDR-TB drug resistance from 20 M. tuberculosis SNPs; the Foundation Models tab\'s ESM-2 scores whether a novel P. falciparum variant is likely pathogenic before anyone runs a wet-lab experiment. These aren\'t hypothetical — they\'re the same categories of tool used in real African genomics research.' },
          ],
          theory: 'A classical bioinformatics pipeline applies fixed, human-authored rules to data (a threshold, a lookup table, a scoring formula someone derived). Machine learning flips this: you give the model many examples that already have a known correct answer (a "label" — e.g. this M. tuberculosis genome is drug-resistant, this one isn\'t), and the model searches for a pattern across the input features that best predicts that label. The result is a rule, but one discovered from data rather than typed by a person — which is what lets it capture patterns too complex or high-dimensional for anyone to write out explicitly.',
          worked: 'Open the AI/ML tool\'s Africa Applications tab and read two or three of the real deployed examples — notice each one names the actual disease, actual dataset, and actual outcome, not a hypothetical.',
          tryItTool: { mode: 'ai-ml-bio', tab: 'africa', label: 'See real African ML applications' },
          terms: [
            { term: 'Machine learning', def: 'A model that learns a predictive rule from labeled examples, rather than following a rule a person wrote by hand.' },
            { term: 'Training data', def: 'The set of labeled examples a model learns from.' },
            { term: 'Feature', def: 'One measurable input the model sees per sample — e.g. a SNP genotype, a gene\'s expression level, a read\'s GC content.' },
            { term: 'Label', def: 'The known correct answer attached to a training example — what the model is trying to learn to predict.' },
          ],
          misconceptions: [
            { claim: '"ML is a black box that just guesses."', correction: 'A trained model\'s predictions are checked against real held-out examples with known answers — that\'s exactly what lets you measure whether it actually works, covered in the confusion-matrix lesson later in this track.' },
            { claim: '"ML replaces the need for biological domain knowledge."', correction: 'Deciding what counts as a good feature or a correct label still requires real biological understanding — a model trained on badly-chosen features or mislabeled data will confidently learn the wrong thing.' },
          ],
          summary: [
            'Traditional pipelines apply rules a person wrote; ML learns its own rule from labeled examples instead.',
            'Omics data is wide (many features) and noisy — exactly the conditions where hand-written thresholds break down.',
            'ML in this platform isn\'t hypothetical — Random Forest MDR-TB prediction and ESM-2 variant scoring are real deployed examples.',
            'A feature is one input a model sees per sample; a label is the known correct answer it\'s trying to predict.',
            'Good features and correct labels still require real biological domain knowledge to define.',
          ],
          quiz: [
            { q: 'What is the core difference between a traditional rule-based pipeline and a machine learning model?', options: ['ML models never make mistakes', 'A rule-based pipeline follows a rule a person wrote; ML learns its own rule from labeled examples', 'ML only works on images, not sequence data', 'They are the same thing with different names'], correct: 1, explain: 'The defining difference is where the rule comes from — hand-written vs. learned from labeled data.' },
            { q: 'Why does omics data specifically push researchers toward ML over simple thresholds?', options: ['Omics data is always small in size', 'Omics data is wide (many features) and irregular, exactly where simple thresholds tend to break down', 'ML is required by journal publication policy', 'Thresholds only work on protein data'], correct: 1, explain: 'High dimensionality plus noise is exactly the setting where a learned model can outperform a fixed rule.' },
            { q: 'A model trained on mislabeled data (e.g. wrong resistant/susceptible labels) will most likely:', options: ['Automatically detect and fix the mislabeled examples', 'Confidently learn the wrong pattern', 'Refuse to train at all', 'Perform identically to a model trained on correct labels'], correct: 1, explain: 'Models learn whatever pattern is in the labels they\'re given — garbage labels in, confidently wrong predictions out.' },
          ],
        },
        {
          id: 'aiml-02', title: 'How a model actually learns from omics data', duration: '20 min', icon: 'layers',
          why: 'A headline like "97% accurate" is meaningless until you know it was measured on data the model never trained on — otherwise it may just have memorized the training set, which is a very live risk in genomics where studies often have far more features (genes, SNPs) than patients.',
          prereq: 'aiml-01',
          concepts: [
            { name: 'Every sample becomes a row of features plus a label', body: 'To a model, a patient sample is just a row of numbers — e.g. genotype at 20 specific SNP positions — paired with a label such as "drug-resistant" or "susceptible." The model never sees the biology directly, only whatever numeric features you hand it.', analogy: 'Like judging a book purely from a spreadsheet of statistics about it (page count, word frequency, publish year) without ever reading the actual text.' },
            { name: 'Train/test split — why you never grade on the training set', body: 'Data is split into a training set the model learns from and a held-out test set it never sees during training. Reporting accuracy on the training set is like grading students on the exact questions they were given the answers to beforehand.', analogy: 'A driving instructor testing you only on the exact route you rehearsed a hundred times tells you nothing about whether you can actually drive elsewhere.' },
            { name: 'Overfitting — memorizing noise instead of learning signal', body: 'A model with too much flexibility relative to the amount of training data can fit the noise in that specific dataset perfectly, achieving near-100% training accuracy while performing barely better than random on new data — the "large p, small n" problem: many genomic studies have thousands of features but only hundreds of patients.' },
          ],
          theory: 'Training works by repeatedly adjusting the model\'s internal parameters to reduce the gap between its predictions and the true labels on the training set — this gap is called the loss. Pushed far enough with too little data relative to the number of features, the model can drive training loss to near zero not by learning genuine biological signal, but by fitting sample-specific noise (sequencing artifacts, batch effects, coincidental correlations) that has no real predictive value elsewhere. The held-out test set is the only honest check: if test performance is far worse than training performance, that gap is direct evidence of overfitting.',
          worked: 'Open the AI/ML tool\'s Practice & Build tab and try the pipeline-order exercise — it asks you to put real ML steps (including train/test split) into the correct order, which is exactly the workflow this lesson describes.',
          tryItTool: { mode: 'ai-ml-bio', tab: 'practice', label: 'Try the ML pipeline-order exercise' },
          terms: [
            { term: 'Feature', def: 'One measurable numeric input per sample that the model actually sees (e.g. a SNP genotype, an expression value).' },
            { term: 'Train/test split', def: 'Dividing data into a set the model learns from and a separate held-out set used only to honestly measure performance.' },
            { term: 'Overfitting', def: 'A model fitting noise specific to its training data rather than a generalizable pattern — high training accuracy, poor test accuracy.' },
            { term: 'Large p, small n', def: 'A dataset with many features (p) but few samples (n) — common in genomics, and a major risk factor for overfitting.' },
          ],
          misconceptions: [
            { claim: '"More features always make a model better."', correction: 'With a small number of samples, adding more features increases the risk of overfitting rather than improving real performance — this is exactly the "large p, small n" problem genomics studies run into constantly.' },
            { claim: '"High training accuracy proves the model works."', correction: 'Training accuracy only proves the model fit the training data — it says nothing about new data until you check held-out test performance separately.' },
          ],
          summary: [
            'A model sees each sample as a row of numeric features paired with a label — never the raw biology directly.',
            'Train/test split exists so performance is measured honestly, on data the model never learned from.',
            'Overfitting means fitting noise in the training set rather than a generalizable pattern — training accuracy alone can\'t catch this.',
            'Genomics studies are especially prone to overfitting because they often have far more features than samples ("large p, small n").',
            'A large gap between training and test performance is direct evidence a model has overfit.',
          ],
          quiz: [
            { q: 'Why is reporting a model\'s accuracy on its own training set misleading?', options: ['Training accuracy is always exactly 50%', 'The model may have simply memorized that specific data rather than learned a generalizable pattern', 'Training sets are never large enough to compute accuracy', 'It isn\'t misleading — training accuracy is the standard metric'], correct: 1, explain: 'Training accuracy can be inflated by memorization (overfitting) — only held-out test performance reflects real-world generalization.' },
            { q: 'What makes genomics data especially prone to overfitting?', options: ['Genomic data is always perfectly clean', 'Studies often have far more features (genes/SNPs) than patient samples', 'DNA sequences cannot be converted into numeric features', 'Overfitting is impossible with biological data'], correct: 1, explain: 'The "large p, small n" pattern — many features, few samples — is a classic overfitting risk factor common across genomics.' },
            { q: 'A model scores 99% on training data but 54% on held-out test data. What does this most likely indicate?', options: ['The model is excellent and ready to deploy', 'The model has overfit the training data', 'The test set must be labeled incorrectly', 'This gap is normal and expected for all models'], correct: 1, explain: 'A large train/test performance gap is the textbook signature of overfitting.' },
          ],
        },
        {
          id: 'aiml-03', title: 'Classical ML vs. foundation models — when to use which', duration: '18 min', icon: 'zap',
          why: 'This platform\'s AI/ML tool lists six classical algorithms and six foundation models side by side — without a decision framework, that just looks like an arbitrary catalogue instead of two genuinely different tools for genuinely different jobs.',
          prereq: 'aiml-02',
          concepts: [
            { name: 'Classical ML: trained from scratch on your data', body: 'Algorithms like Random Forest or Logistic Regression start with no prior knowledge and learn entirely from the labeled dataset you give them. They tend to work well on structured, tabular data (a spreadsheet of SNPs and outcomes) and stay interpretable — you can usually see which features drove a prediction.' },
            { name: 'Foundation models: pretrained on massive general data, then adapted', body: 'A model like ESM-2 was already trained on 250 million protein sequences before you ever touch it. Using it on your specific problem means adapting ("fine-tuning") that existing general knowledge, rather than starting from zero — which is what lets it work well even when you only have a small labeled dataset of your own.', analogy: 'Like hiring someone who already has a medical degree and just needs orientation to your specific clinic, versus training someone from complete scratch.' },
            { name: 'Matching the tool to the data you actually have', body: 'Small, well-structured tabular data with a real need for interpretability (e.g. a GWAS case-control table) usually favors classical ML. Raw sequence, structure, or single-cell data — especially with limited labeled examples of your own — usually favors a foundation model, because its pretraining already encodes general biological patterns.' },
          ],
          theory: 'The technical name for what a foundation model gives you is transfer learning: knowledge learned from a huge, general pretraining dataset transfers to your specific, much smaller task, so the model needs far fewer labeled examples of your own to perform well. Classical ML has no such transfer — every classical model starts genuinely blank and depends entirely on the size and quality of the dataset you provide it. Neither approach is universally "better": a foundation model brings transferred general knowledge at the cost of being larger, slower, and harder to interpret; classical ML brings speed and interpretability at the cost of needing a reasonably sized, well-labeled dataset of its own.',
          worked: 'Open the AI/ML tool\'s Classical ML tab and use the "which algorithm" chooser — then compare against browsing the Foundation Models tab\'s task lists. Notice how the classical tab\'s use-cases (GWAS, resistance prediction from a SNP table) differ in shape from the foundation-model tab\'s use-cases (raw sequence/structure input).',
          tryItTool: { mode: 'ai-ml-bio', tab: 'classical', label: 'Try the algorithm chooser' },
          terms: [
            { term: 'Classical ML', def: 'A model trained entirely from scratch on the labeled dataset you provide, with no prior pretraining.' },
            { term: 'Foundation model', def: 'A model pretrained on a massive general dataset before being adapted to a specific task.' },
            { term: 'Transfer learning', def: 'Reusing knowledge learned during pretraining on a new, typically much smaller and more specific task.' },
            { term: 'Fine-tuning', def: 'The process of further training a pretrained foundation model on your specific, smaller dataset.' },
          ],
          misconceptions: [
            { claim: '"Foundation models are always better than classical ML."', correction: 'For small, structured tabular problems needing interpretability — like a GWAS case-control study — classical ML (e.g. logistic regression) is often the better, more appropriate choice, not an inferior fallback.' },
            { claim: '"Classical ML is outdated technology."', correction: 'Gradient-boosted trees and similar classical methods remain state-of-the-art for tabular prediction tasks like polygenic risk scores — they are current best practice, not legacy tools.' },
          ],
          summary: [
            'Classical ML starts from zero and learns entirely from your dataset; foundation models start pretrained on massive general data.',
            'Transfer learning is what lets a foundation model perform well even with relatively few labeled examples of your own.',
            'Classical ML tends to favor structured tabular data and interpretability; foundation models favor raw sequence/structure data with limited labels.',
            'Neither is universally better — the right choice depends on your data\'s shape and how much labeled data you actually have.',
            'Fine-tuning is the process of adapting a pretrained foundation model to your specific task.',
          ],
          quiz: [
            { q: 'What does "transfer learning" specifically refer to?', options: ['Copying a dataset from one computer to another', 'Reusing knowledge a model learned during large-scale pretraining on a new, more specific task', 'Converting DNA sequences into RNA sequences', 'Training two models simultaneously'], correct: 1, explain: 'Transfer learning means pretrained general knowledge carries over ("transfers") to help with a new, smaller task.' },
            { q: 'For a small, well-structured GWAS case-control table where interpretability matters, which approach is typically more appropriate?', options: ['A large foundation model, always', 'Classical ML (e.g. logistic regression)', 'Neither approach can handle tabular data', 'Foundation models cannot be fine-tuned'], correct: 1, explain: 'Structured tabular data with a real need for interpretability is the classic strength case for classical ML.' },
            { q: 'Why can a foundation model often perform well with fewer labeled examples than classical ML needs?', options: ['Foundation models don\'t actually need any data', 'Its pretraining already encodes general patterns that transfer to the new task', 'Foundation models are always smaller than classical models', 'This is a myth — they need equally large labeled datasets'], correct: 1, explain: 'Pretraining is what supplies the general knowledge classical ML would otherwise have to learn entirely from your own limited labels.' },
          ],
        },
        {
          id: 'aiml-04', title: 'Reading a confusion matrix — evaluating a real model', duration: '20 min', icon: 'bar-chart',
          why: 'A claimed "97% accurate" diagnostic model can still be nearly useless if the disease it\'s detecting is rare — a model that always predicts "healthy" can hit 97% accuracy on a population where only 3% are actually sick, while catching zero real cases. Reading the confusion matrix, not the headline number, is what tells you whether a model actually works.',
          prereq: 'aiml-03',
          concepts: [
            { name: 'The four outcomes of a binary prediction', body: 'For a resistant/susceptible call, every prediction lands in one of four boxes: true positive (correctly called resistant), true negative (correctly called susceptible), false positive (wrongly called resistant), false negative (wrongly called susceptible, the dangerous miss). The confusion matrix is just these four counts laid out in a grid.' },
            { name: 'Sensitivity vs. specificity — two different questions', body: 'Sensitivity (recall) asks: of everyone who is actually resistant, how many did the model catch? Specificity asks: of everyone who is actually susceptible, how many did the model correctly clear? A model can score high on one while scoring poorly on the other — they are not interchangeable.', analogy: 'Sensitivity is like a smoke detector\'s ability to catch every real fire; specificity is its ability to not go off when someone is just making toast.' },
            { name: 'The accuracy paradox with imbalanced classes', body: 'When one outcome is rare (e.g. only 3% of samples are truly drug-resistant), a model that just predicts the majority class every time can post a high overall accuracy while being clinically useless — it never catches the cases that actually matter.' },
          ],
          theory: 'Overall accuracy is (true positives + true negatives) divided by all predictions — a single number that treats every correct call as equally valuable. But in an imbalanced dataset, that single number can hide near-total failure on the minority class: if 97% of samples are truly susceptible, a model that predicts "susceptible" for every single sample scores 97% accuracy while having a sensitivity of exactly 0% — it never once correctly identifies a resistant case. This is precisely why the confusion matrix\'s four separate counts, and the sensitivity/specificity computed from them, matter more than the single accuracy headline, especially for rare-disease or rare-outcome prediction tasks common in genomics.',
          worked: 'Open the AI/ML tool\'s Practice & Build tab and use the confusion-matrix calculator — enter counts for a resistant/susceptible prediction scenario and watch how sensitivity and specificity can diverge sharply from the overall accuracy number.',
          tryItTool: { mode: 'ai-ml-bio', tab: 'practice', label: 'Try the confusion-matrix calculator' },
          terms: [
            { term: 'True/false positive', def: 'A positive prediction that was correct (true) or incorrect (false) against the real label.' },
            { term: 'True/false negative', def: 'A negative prediction that was correct (true) or incorrect (false) against the real label.' },
            { term: 'Sensitivity (recall)', def: 'Of all truly positive cases, the fraction the model correctly identified.' },
            { term: 'Specificity', def: 'Of all truly negative cases, the fraction the model correctly identified.' },
            { term: 'Accuracy paradox', def: 'A high overall accuracy score that hides poor performance on a rare but important class.' },
          ],
          misconceptions: [
            { claim: '"A high accuracy percentage means the model is clinically useful."', correction: 'With imbalanced classes, a high accuracy can coexist with near-zero sensitivity for the exact outcome that matters most — always check the confusion matrix, not just the headline number.' },
            { claim: '"Sensitivity and specificity measure the same thing."', correction: 'They answer two different questions — catching true positives vs. correctly clearing true negatives — and a model can score very differently on each.' },
          ],
          summary: [
            'Every binary prediction lands in one of four boxes: true positive, true negative, false positive, false negative.',
            'Sensitivity asks how many real positives were caught; specificity asks how many real negatives were correctly cleared — they can diverge sharply.',
            'With imbalanced classes, a model can post high accuracy while having near-zero sensitivity for the rare, important outcome.',
            'The confusion matrix\'s four separate counts reveal failure modes a single accuracy number can hide.',
            'This matters most exactly where genomics often lands: rare-disease or rare-resistance prediction with imbalanced classes.',
          ],
          quiz: [
            { q: 'In a dataset where 97% of samples are truly susceptible, a model that always predicts "susceptible" would score:', options: ['0% accuracy', '~97% accuracy but 0% sensitivity for resistant cases', '50% accuracy exactly', 'It would fail to run'], correct: 1, explain: 'This is the accuracy paradox — high accuracy from always guessing the majority class, while catching zero true positives.' },
            { q: 'What does sensitivity (recall) specifically measure?', options: ['Overall percentage of all correct predictions', 'Of all truly positive cases, the fraction correctly identified', 'Of all truly negative cases, the fraction correctly identified', 'How fast the model makes predictions'], correct: 1, explain: 'Sensitivity is about catching real positives — a distinct question from overall accuracy or specificity.' },
            { q: 'Why is the confusion matrix more informative than a single accuracy number for imbalanced genomic prediction tasks?', options: ['It is not more informative — accuracy alone is always sufficient', 'It separates the four outcome types, revealing failures a single number can hide on the minority (often clinically critical) class', 'The confusion matrix replaces the need for a test set', 'It only applies to image classification tasks'], correct: 1, explain: 'The four-way breakdown exposes exactly where a model fails, which a single blended accuracy score cannot.' },
          ],
        },
      ],
    },
  };

  /* ─── Progress store ─── */
  function _loadProgress() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || '{}'); }
    catch { return {}; }
  }
  function _saveProgress(p) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(p)); } catch {}
  }
  function _markComplete(lessonId) {
    const p = _loadProgress();
    p[lessonId] = { done: true, ts: new Date().toISOString() };
    _saveProgress(p);
    _checkTrackCompletion();
    _refresh();
  }
  function _isComplete(lessonId) { return !!_loadProgress()[lessonId]; }

  function _trackProgress(trackId) {
    const track = TRACKS[trackId];
    if (!track) return { done: 0, total: 0, pct: 0 };
    const done = track.lessons.filter(l => _isComplete(l.id)).length;
    return { done, total: track.lessons.length, pct: Math.round(done / track.lessons.length * 100) };
  }

  /* Reads the REAL score written by a completed lab simulation
     (js/app.js's showResults()) — not a self-reported or honor-system
     value. A track's certificate can require this in addition to its
     lessons, so "certified" means something was actually demonstrated,
     not just read through. */
  function _capstoneStatus(trackId) {
    const cap = TRACKS[trackId]?.capstone;
    if (!cap) return null;
    const raw = localStorage.getItem('omicslab_score_' + cap.workflowId);
    const score = raw != null ? parseInt(raw, 10) : null;
    return { ...cap, score, met: score != null && score >= cap.minScore };
  }

  function _checkTrackCompletion() {
    Object.values(TRACKS).forEach(t => {
      const p = _trackProgress(t.id);
      const cap = _capstoneStatus(t.id);
      const earned = p.pct === 100 && (!cap || cap.met);
      if (earned && OmicsLab.Badges) OmicsLab.Badges.unlock(t.badge);
    });
  }

  /* ─── Render helpers ─── */
  function _renderTrackCard(track) {
    const prog = _trackProgress(track.id);
    return `
    <div class="curr-track-card" onclick="OmicsLab.Curriculum.openTrack('${track.id}')">
      <div class="curr-track-top" style="--track-color:${track.color}">
        <div class="curr-track-icon">${OmicsLab.Icons?.svg(track.icon, 28) || track.icon}</div>
        <div class="curr-track-badge-area" id="curr-badge-${track.id}">
          ${prog.pct === 100 ? '<span class="curr-complete-badge">[OK] Complete</span>' : track.recommended ? '<span class="curr-recommended-badge">Start here</span>' : ''}
        </div>
      </div>
      <div class="curr-track-body">
        <div class="curr-track-title">${track.title}</div>
        <div class="curr-track-subtitle">${track.subtitle}</div>
        <div class="curr-track-audience">${track.audience}</div>
        <div class="curr-progress-wrap">
          <div class="curr-progress-bar">
            <div class="curr-progress-fill" style="width:${prog.pct}%;background:${track.color}"></div>
          </div>
          <div class="curr-progress-label">${prog.done}/${prog.total} lessons · ${prog.pct}%</div>
        </div>
        <button class="curr-start-btn" style="background:${track.color}">
          ${prog.done === 0 ? 'Start Track' : prog.pct === 100 ? 'Review Track' : 'Continue →'}
        </button>
      </div>
    </div>`;
  }

  function _renderLessonList(trackId) {
    const track = TRACKS[trackId];
    if (!track) return '';
    const nextIdx = track.lessons.findIndex(l => !_isComplete(l.id));
    return track.lessons.map((l, i) => {
      const done = _isComplete(l.id);
      const isNext = i === nextIdx;
      const isChapter = !!l.quiz; /* new-style lesson: full chapter + real quiz gate */
      const previewText = isChapter ? l.why : l.summary;
      return `
      <div class="curr-lesson-row ${done ? 'done' : isNext ? 'next' : 'locked'}">
        <div class="curr-lesson-num">${done ? '[OK]' : (i + 1)}</div>
        <div class="curr-lesson-info">
          <div class="curr-lesson-title">${OmicsLab.Icons?.svg(l.icon, 14) || ''} ${l.title}</div>
          <div class="curr-lesson-meta">${l.duration} · ${previewText.substring(0, 90)}…</div>
          ${isChapter ? '' : `<div class="curr-key-points">
            ${l.keyPoints.map(p => `<span class="curr-kp">• ${p}</span>`).join('')}
          </div>`}
        </div>
        <div class="curr-lesson-actions">
          ${isChapter
            ? `${isNext || done ? `<button class="curr-go-btn" onclick="OmicsLab.Curriculum.openLesson('${l.id}','${trackId}')">${done ? 'Review' : 'Start lesson'}</button>` : ''}`
            : `${isNext || done ? `<button class="curr-go-btn" onclick="OmicsLab.Curriculum.goToLesson('${l.id}','${l.action}','${trackId}')">${done ? 'Review' : 'Start'}</button>` : ''}
               ${!done ? `<button class="curr-mark-btn" onclick="OmicsLab.Curriculum.markDone('${l.id}','${trackId}')">Mark done</button>` : ''}`}
        </div>
      </div>`;
    }).join('');
  }

  function _renderCapstoneCard(trackId) {
    const cap = _capstoneStatus(trackId);
    if (!cap) return '';
    return `
    <div class="curr-capstone-card ${cap.met ? 'met' : ''}">
      <div class="curr-capstone-label">${cap.met ? 'Capstone complete' : 'Final requirement for certification'}</div>
      <div class="curr-capstone-title">${cap.label}</div>
      <p class="curr-capstone-desc">${cap.desc}</p>
      ${cap.score != null ? `<div class="curr-capstone-score">Best score so far: <b>${cap.score}/100</b>${cap.met ? ' — requirement met' : ` — need ${cap.minScore}+`}</div>` : ''}
      ${!cap.met ? `<button type="button" class="curr-capstone-btn" onclick="OmicsLab.App && OmicsLab.App.startWorkflow('${cap.workflowId}')">Run it now</button>` : ''}
    </div>`;
  }

  function _renderDetailPanel(trackId) {
    const track = TRACKS[trackId];
    if (!track) return '';
    const prog = _trackProgress(trackId);
    return `
    <div class="curr-detail-panel" id="curr-detail-${trackId}">
      <div class="curr-detail-header" style="border-left-color:${track.color}">
        <div class="curr-detail-title">${OmicsLab.Icons?.svg(track.icon, 20) || ''} ${track.title}</div>
        <div class="curr-detail-sub">${track.subtitle}</div>
        <div class="curr-detail-outcome"><strong>Learning outcome:</strong> ${track.outcome}</div>
        <div class="curr-detail-progress">
          <div class="curr-progress-bar" style="max-width:300px">
            <div class="curr-progress-fill" style="width:${prog.pct}%;background:${track.color}"></div>
          </div>
          <span style="font-size:0.82rem;color:var(--text-muted)">${prog.done}/${prog.total} complete</span>
        </div>
      </div>
      <div class="curr-lesson-list" id="curr-lessons-${trackId}">${_renderLessonList(trackId)}</div>
      <div id="curr-capstone-${trackId}">${_renderCapstoneCard(trackId)}</div>
      <div id="curr-lesson-detail-${trackId}"></div>
    </div>`;
  }

  /* ─── Full chapter view + real quiz gate (Foundations-style lessons) ───
     Completion requires answering every quiz question correctly — no
     honor-system "Mark done" button for these lessons. */
  function _renderLessonDetail(lessonId, trackId) {
    const track  = TRACKS[trackId];
    const lesson = track?.lessons.find(l => l.id === lessonId);
    if (!lesson) return '';
    const done = _isComplete(lessonId);

    return `
    <div class="curr-chapter" id="curr-chapter-${lessonId}" style="--track-color:${track.color}">
      <button type="button" class="curr-chapter-close" onclick="OmicsLab.Curriculum._closeLessonDetail('${trackId}')" aria-label="Close">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>

      <h3 class="curr-ch-title">${OmicsLab.Icons?.svg(lesson.icon, 18) || ''} ${lesson.title}</h3>
      <div class="curr-ch-duration">${lesson.duration}${done ? ' · <span class="curr-ch-done-tag">Completed</span>' : ''}</div>

      <div class="curr-ch-section curr-ch-why">
        <div class="curr-ch-h">Why it matters</div>
        <p>${lesson.why}</p>
      </div>

      <div class="curr-ch-section">
        <div class="curr-ch-h">Core concepts</div>
        ${lesson.concepts.map(c => `
          <div class="curr-ch-concept">
            <div class="curr-ch-concept-name">${c.name}</div>
            <p>${c.body}</p>
            ${c.analogy ? `<div class="curr-ch-analogy"><b>Think of it like:</b> ${c.analogy}</div>` : ''}
          </div>`).join('')}
      </div>

      <div class="curr-ch-section">
        <div class="curr-ch-h">What's actually happening</div>
        <p>${lesson.theory}</p>
      </div>

      <div class="curr-ch-section">
        <div class="curr-ch-h">Try it</div>
        <p>${lesson.worked}</p>
        ${lesson.tryItTool ? `<button type="button" class="curr-tryit-btn" onclick="OmicsLab.Curriculum._openTool('${lesson.tryItTool.mode}','${lesson.tryItTool.tab||''}')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          ${lesson.tryItTool.label} — it's the real tool, not a description
        </button>` : ''}
      </div>

      <div class="curr-ch-section">
        <div class="curr-ch-h">Key terms</div>
        <dl class="curr-ch-glossary">
          ${lesson.terms.map(t => `<dt>${t.term}</dt><dd>${t.def}</dd>`).join('')}
        </dl>
      </div>

      <div class="curr-ch-section">
        <div class="curr-ch-h">Where students get this wrong</div>
        ${lesson.misconceptions.map(m => `
          <div class="curr-ch-misconception">
            <div class="curr-ch-claim">${m.claim}</div>
            <div class="curr-ch-correction">${m.correction}</div>
          </div>`).join('')}
      </div>

      <div class="curr-ch-section">
        <div class="curr-ch-h">Summary</div>
        <ul class="curr-ch-summary">${lesson.summary.map(s => `<li>${s}</li>`).join('')}</ul>
      </div>

      <div class="curr-ch-section curr-ch-quiz" id="curr-quiz-${lessonId}">
        <div class="curr-ch-h">Check yourself — answer all ${lesson.quiz.length} to complete this lesson</div>
        ${lesson.quiz.map((q, qi) => `
          <div class="curr-quiz-q" data-qi="${qi}" data-correct="${q.correct}">
            <div class="curr-quiz-question">${qi + 1}. ${q.q}</div>
            <div class="curr-quiz-opts">
              ${q.options.map((opt, oi) => `
                <button type="button" class="curr-quiz-opt" data-oi="${oi}"
                  onclick="OmicsLab.Curriculum._selectAnswer('${lessonId}',${qi},${oi})">${opt}</button>`).join('')}
            </div>
            <div class="curr-quiz-feedback" style="display:none"></div>
          </div>`).join('')}
        <button type="button" class="curr-quiz-submit" id="curr-quiz-submit-${lessonId}"
          onclick="OmicsLab.Curriculum.submitQuiz('${lessonId}','${trackId}')" ${done ? 'style="display:none"' : ''}>
          Submit answers
        </button>
        <div class="curr-quiz-result" id="curr-quiz-result-${lessonId}"></div>
      </div>
    </div>`;
  }

  /* ─── Public API ─── */
  let _activeTrack = null;

  function openTrack(trackId) {
    _activeTrack = trackId;
    const panel = document.getElementById('curr-detail-area');
    if (!panel) return;
    panel.innerHTML = _renderDetailPanel(trackId);
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });

    document.querySelectorAll('.curr-track-card').forEach(c => {
      c.classList.toggle('active', c.getAttribute('onclick').includes(trackId));
    });
  }

  function markDone(lessonId, trackId) {
    _markComplete(lessonId);
    const list = document.getElementById('curr-lessons-' + trackId);
    if (list) list.innerHTML = _renderLessonList(trackId);
    const prog = _trackProgress(trackId);
    const track = TRACKS[trackId];
    const fill = document.querySelector(`#curr-detail-${trackId} .curr-progress-fill`);
    if (fill && track) fill.style.width = prog.pct + '%';
    if (prog.pct === 100) {
      const detail = document.getElementById(`curr-detail-${trackId}`);
      if (detail) detail.innerHTML = _renderDetailPanel(trackId);
    }
  }

  function goToLesson(lessonId, sectionId, trackId) {
    if (OmicsLab.App) OmicsLab.App.scrollTo(sectionId);
    setTimeout(() => _markComplete(lessonId), 800);
    const list = document.getElementById('curr-lessons-' + trackId);
    if (list) setTimeout(() => { list.innerHTML = _renderLessonList(trackId); }, 900);
  }

  /* ─── Chapter-style lesson: open, answer, submit ─── */
  const _quizAnswers = {}; /* lessonId -> { qIndex: selectedOptionIndex } */

  function openLesson(lessonId, trackId) {
    const mount = document.getElementById('curr-lesson-detail-' + trackId);
    if (!mount) return;
    _quizAnswers[lessonId] = {};
    mount.innerHTML = _renderLessonDetail(lessonId, trackId);
    document.getElementById('curr-chapter-' + lessonId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function _closeLessonDetail(trackId) {
    const mount = document.getElementById('curr-lesson-detail-' + trackId);
    if (mount) mount.innerHTML = '';
  }

  /* Launches the REAL Terminal/Python-Notebook tool (js/terminal.js — the
     notebook mode runs actual Python via Pyodide, not a simulation), instead
     of only describing it in prose. Clicks the real mode-tab button rather
     than re-implementing switchMode()'s internals, since that function
     expects a genuine button element. */
  function _openTool(mode, tab) {
    if (mode === 'ai-ml-bio') {
      if (OmicsLab.Router) OmicsLab.Router.navigate('ai-ml-bio');
      if (tab) setTimeout(() => OmicsLab.AIMLBio?.setTab?.(tab), 150);
      return;
    }
    if (OmicsLab.Router) OmicsLab.Router.navigate('terminal');
    setTimeout(() => {
      if (mode === 'notebook') {
        document.querySelector('.term-mode-tab.nb-tab-btn')?.click();
      } else {
        OmicsLab.Terminal?.focusInput?.();
      }
    }, 150);
  }

  function _selectAnswer(lessonId, qIndex, optIndex) {
    if (_isComplete(lessonId)) return; /* already passed — answers locked */
    _quizAnswers[lessonId] = _quizAnswers[lessonId] || {};
    _quizAnswers[lessonId][qIndex] = optIndex;
    const qEl = document.querySelector(`#curr-quiz-${lessonId} .curr-quiz-q[data-qi="${qIndex}"]`);
    if (!qEl) return;
    qEl.querySelectorAll('.curr-quiz-opt').forEach(b => b.classList.toggle('selected', +b.dataset.oi === optIndex));
  }

  function submitQuiz(lessonId, trackId) {
    const track  = TRACKS[trackId];
    const lesson = track?.lessons.find(l => l.id === lessonId);
    if (!lesson) return;
    const answers = _quizAnswers[lessonId] || {};
    const resultEl = document.getElementById('curr-quiz-result-' + lessonId);

    if (Object.keys(answers).length < lesson.quiz.length) {
      resultEl.innerHTML = `<div class="curr-quiz-msg curr-quiz-msg-warn">Answer all ${lesson.quiz.length} questions before submitting.</div>`;
      return;
    }

    let correct = 0;
    lesson.quiz.forEach((q, qi) => {
      const qEl = document.querySelector(`#curr-quiz-${lessonId} .curr-quiz-q[data-qi="${qi}"]`);
      const fb  = qEl?.querySelector('.curr-quiz-feedback');
      const isRight = answers[qi] === q.correct;
      if (isRight) correct++;
      qEl?.querySelectorAll('.curr-quiz-opt').forEach(b => {
        const oi = +b.dataset.oi;
        b.classList.toggle('correct-answer', oi === q.correct);
        b.classList.toggle('wrong-answer', oi === answers[qi] && oi !== q.correct);
        b.disabled = true;
      });
      if (fb) { fb.style.display = 'block'; fb.textContent = q.explain; }
    });

    if (correct === lesson.quiz.length) {
      _markComplete(lessonId);
      resultEl.innerHTML = `<div class="curr-quiz-msg curr-quiz-msg-pass">All ${correct}/${lesson.quiz.length} correct — lesson complete.</div>`;
      document.getElementById('curr-quiz-submit-' + lessonId)?.style.setProperty('display', 'none');
      const list = document.getElementById('curr-lessons-' + trackId);
      if (list) list.innerHTML = _renderLessonList(trackId);
    } else {
      resultEl.innerHTML = `<div class="curr-quiz-msg curr-quiz-msg-fail">${correct}/${lesson.quiz.length} correct. Review the explanations above, then try again.</div>
        <button type="button" class="curr-quiz-retry" onclick="OmicsLab.Curriculum.openLesson('${lessonId}','${trackId}')">Retry quiz</button>`;
    }
  }

  function _refresh() {
    Object.keys(TRACKS).forEach(tid => {
      const badgeArea = document.getElementById('curr-badge-' + tid);
      const prog = _trackProgress(tid);
      if (badgeArea && prog.pct === 100) badgeArea.innerHTML = '<span class="curr-complete-badge">[OK] Complete</span>';
      const fill = document.querySelector(`.curr-track-card[onclick*="${tid}"] .curr-progress-fill`);
      if (fill) { fill.style.width = prog.pct + '%'; fill.style.background = TRACKS[tid].color; }
      const label = document.querySelector(`.curr-track-card[onclick*="${tid}"] .curr-progress-label`);
      if (label) label.textContent = `${prog.done}/${prog.total} lessons · ${prog.pct}%`;
    });
    const continueArea = document.getElementById('curr-continue-area');
    if (continueArea) continueArea.innerHTML = _renderContinueRow();
  }

  function resetProgress() {
    if (!confirm('Reset all curriculum progress?')) return;
    localStorage.removeItem(STORE_KEY);
    init();
  }

  function getCompletedCount() {
    return Object.keys(_loadProgress()).length;
  }

  /* Kaggle-style "continue where you left off" strip — only tracks a
     learner has actually started and not finished, each showing the
     specific next lesson by name (not just a generic progress bar). */
  function _renderContinueRow() {
    const inProgress = Object.values(TRACKS)
      .map(t => ({ track: t, prog: _trackProgress(t.id) }))
      .filter(({ prog }) => prog.done > 0 && prog.pct < 100);
    if (!inProgress.length) return '';

    return `
      <div class="curr-continue-section">
        <div class="curr-section-label">Your tracks</div>
        <div class="curr-continue-row">
          ${inProgress.map(({ track, prog }) => {
            const nextLesson = track.lessons.find(l => !_isComplete(l.id));
            return `
            <div class="curr-continue-card" onclick="OmicsLab.Curriculum.openTrack('${track.id}')" style="--track-color:${track.color}">
              <div class="curr-continue-title">${track.title}</div>
              <div class="curr-continue-next">Next up: ${nextLesson ? nextLesson.title : '—'}</div>
              <div class="curr-progress-bar"><div class="curr-progress-fill" style="width:${prog.pct}%;background:${track.color}"></div></div>
              <div class="curr-continue-pct">${prog.pct}%</div>
            </div>`;
          }).join('')}
        </div>
      </div>`;
  }

  function init() {
    const container = document.getElementById('curriculum-content');
    if (!container) return;

    const totalDone = Object.values(TRACKS).reduce((s, t) => s + _trackProgress(t.id).done, 0);
    const totalAll  = Object.values(TRACKS).reduce((s, t) => s + t.lessons.length, 0);
    const overallPct = Math.round(totalDone / totalAll * 100);
    const continueRow = _renderContinueRow();

    container.innerHTML = `
      <div class="curr-overview-bar">
        <div class="curr-overview-stat">
          <div class="curr-stat-n">${totalDone}</div>
          <div class="curr-stat-l">Lessons complete</div>
        </div>
        <div class="curr-overview-stat">
          <div class="curr-stat-n">${totalAll - totalDone}</div>
          <div class="curr-stat-l">Remaining</div>
        </div>
        <div class="curr-overview-stat">
          <div class="curr-stat-n">${overallPct}%</div>
          <div class="curr-stat-l">Overall progress</div>
        </div>
        <button class="curr-reset-btn" onclick="OmicsLab.Curriculum.resetProgress()">Reset progress</button>
      </div>

      <div id="curr-continue-area">${continueRow}</div>

      <div class="curr-section-label" style="margin-top:${continueRow ? '2rem' : '0'}">All tracks</div>
      <div class="curr-track-grid">
        ${Object.values(TRACKS).map(_renderTrackCard).join('')}
      </div>

      <div id="curr-detail-area" class="curr-detail-area"></div>
    `;
  }

  return {
    init, openTrack, markDone, goToLesson, resetProgress, getCompletedCount, TRACKS,
    openLesson, _closeLessonDetail, _selectAnswer, submitQuiz, _openTool,
  };
})();
