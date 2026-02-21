export interface SampleDataset {
  name: string;
  description: string;
  data: string;
}

const lungCancer: SampleDataset = {
  name: "Lung Cancer Trial",
  description: "Treatment vs Control, n≈50/group, significant separation (p<0.05)",
  data: `Time\tEvent\tGroup
1\t1\tControl
2\t1\tControl
2\t1\tControl
3\t1\tControl
3\t1\tControl
4\t1\tControl
4\t1\tControl
4\t0\tControl
5\t1\tControl
5\t1\tControl
5\t1\tControl
6\t1\tControl
6\t1\tControl
6\t0\tControl
7\t1\tControl
7\t1\tControl
7\t1\tControl
8\t1\tControl
8\t1\tControl
8\t1\tControl
8\t0\tControl
9\t1\tControl
9\t1\tControl
9\t1\tControl
10\t1\tControl
10\t1\tControl
10\t0\tControl
11\t1\tControl
11\t1\tControl
12\t1\tControl
12\t0\tControl
13\t1\tControl
13\t1\tControl
14\t1\tControl
14\t0\tControl
15\t1\tControl
16\t1\tControl
17\t0\tControl
18\t1\tControl
19\t1\tControl
20\t0\tControl
21\t1\tControl
22\t1\tControl
24\t0\tControl
26\t1\tControl
28\t1\tControl
30\t0\tControl
32\t1\tControl
36\t0\tControl
40\t0\tControl
3\t0\tTreatment
5\t1\tTreatment
6\t0\tTreatment
7\t1\tTreatment
8\t1\tTreatment
8\t0\tTreatment
9\t1\tTreatment
9\t0\tTreatment
10\t1\tTreatment
10\t1\tTreatment
10\t0\tTreatment
11\t1\tTreatment
11\t0\tTreatment
12\t1\tTreatment
12\t1\tTreatment
12\t0\tTreatment
13\t1\tTreatment
13\t1\tTreatment
14\t1\tTreatment
14\t0\tTreatment
15\t1\tTreatment
15\t1\tTreatment
16\t1\tTreatment
16\t0\tTreatment
17\t1\tTreatment
18\t1\tTreatment
18\t0\tTreatment
19\t1\tTreatment
20\t1\tTreatment
20\t0\tTreatment
21\t1\tTreatment
22\t1\tTreatment
22\t0\tTreatment
24\t1\tTreatment
24\t0\tTreatment
26\t1\tTreatment
28\t1\tTreatment
28\t0\tTreatment
30\t1\tTreatment
32\t1\tTreatment
34\t0\tTreatment
36\t1\tTreatment
36\t0\tTreatment
38\t1\tTreatment
40\t1\tTreatment
42\t0\tTreatment
44\t1\tTreatment
48\t0\tTreatment
52\t1\tTreatment
60\t0\tTreatment`,
};

const heartFailure: SampleDataset = {
  name: "Heart Failure Study",
  description: "Drug A vs Placebo, n=40/group, moderate effect, ~30% censoring",
  data: `Time\tEvent\tGroup
2\t1\tPlacebo
3\t1\tPlacebo
4\t1\tPlacebo
5\t0\tPlacebo
6\t1\tPlacebo
6\t1\tPlacebo
7\t1\tPlacebo
8\t0\tPlacebo
9\t1\tPlacebo
10\t1\tPlacebo
10\t0\tPlacebo
11\t1\tPlacebo
12\t1\tPlacebo
12\t0\tPlacebo
13\t1\tPlacebo
14\t1\tPlacebo
15\t0\tPlacebo
15\t1\tPlacebo
16\t1\tPlacebo
17\t1\tPlacebo
18\t0\tPlacebo
18\t1\tPlacebo
19\t1\tPlacebo
20\t0\tPlacebo
21\t1\tPlacebo
22\t1\tPlacebo
24\t0\tPlacebo
24\t1\tPlacebo
26\t1\tPlacebo
28\t0\tPlacebo
30\t1\tPlacebo
32\t0\tPlacebo
34\t1\tPlacebo
36\t0\tPlacebo
38\t1\tPlacebo
40\t0\tPlacebo
42\t1\tPlacebo
48\t0\tPlacebo
52\t1\tPlacebo
60\t0\tPlacebo
4\t0\tDrug A
6\t1\tDrug A
8\t0\tDrug A
10\t1\tDrug A
12\t0\tDrug A
14\t1\tDrug A
14\t0\tDrug A
16\t1\tDrug A
16\t0\tDrug A
18\t1\tDrug A
18\t0\tDrug A
20\t1\tDrug A
20\t1\tDrug A
22\t0\tDrug A
24\t1\tDrug A
24\t1\tDrug A
26\t0\tDrug A
26\t1\tDrug A
28\t1\tDrug A
28\t0\tDrug A
30\t1\tDrug A
30\t0\tDrug A
32\t1\tDrug A
34\t1\tDrug A
34\t0\tDrug A
36\t1\tDrug A
38\t0\tDrug A
38\t1\tDrug A
40\t1\tDrug A
42\t0\tDrug A
44\t1\tDrug A
46\t0\tDrug A
48\t1\tDrug A
50\t0\tDrug A
52\t1\tDrug A
56\t0\tDrug A
60\t1\tDrug A
64\t0\tDrug A
72\t1\tDrug A
84\t0\tDrug A`,
};

const reliability: SampleDataset = {
  name: "Engineering Reliability",
  description: "Component A vs B, failure times in hours, no censoring",
  data: `Time\tEvent\tGroup
120\t1\tComponent A
180\t1\tComponent A
210\t1\tComponent A
250\t1\tComponent A
280\t1\tComponent A
310\t1\tComponent A
350\t1\tComponent A
380\t1\tComponent A
400\t1\tComponent A
420\t1\tComponent A
450\t1\tComponent A
470\t1\tComponent A
500\t1\tComponent A
520\t1\tComponent A
540\t1\tComponent A
560\t1\tComponent A
600\t1\tComponent A
640\t1\tComponent A
680\t1\tComponent A
720\t1\tComponent A
760\t1\tComponent A
800\t1\tComponent A
850\t1\tComponent A
900\t1\tComponent A
1000\t1\tComponent A
200\t1\tComponent B
300\t1\tComponent B
380\t1\tComponent B
420\t1\tComponent B
480\t1\tComponent B
520\t1\tComponent B
560\t1\tComponent B
600\t1\tComponent B
640\t1\tComponent B
680\t1\tComponent B
720\t1\tComponent B
760\t1\tComponent B
800\t1\tComponent B
840\t1\tComponent B
880\t1\tComponent B
920\t1\tComponent B
960\t1\tComponent B
1000\t1\tComponent B
1050\t1\tComponent B
1100\t1\tComponent B
1160\t1\tComponent B
1220\t1\tComponent B
1300\t1\tComponent B
1400\t1\tComponent B
1500\t1\tComponent B`,
};

const overlapping: SampleDataset = {
  name: "Overlapping Curves",
  description: "Group X vs Y with similar survival (p>0.3), non-significant result",
  data: `Time\tEvent\tGroup
2\t1\tGroup X
3\t1\tGroup X
5\t1\tGroup X
6\t0\tGroup X
7\t1\tGroup X
8\t1\tGroup X
9\t0\tGroup X
10\t1\tGroup X
11\t1\tGroup X
12\t0\tGroup X
13\t1\tGroup X
14\t1\tGroup X
15\t1\tGroup X
16\t0\tGroup X
18\t1\tGroup X
20\t1\tGroup X
22\t0\tGroup X
24\t1\tGroup X
28\t1\tGroup X
32\t0\tGroup X
36\t1\tGroup X
40\t0\tGroup X
48\t1\tGroup X
56\t0\tGroup X
60\t0\tGroup X
1\t1\tGroup Y
3\t1\tGroup Y
4\t1\tGroup Y
5\t0\tGroup Y
7\t1\tGroup Y
8\t0\tGroup Y
9\t1\tGroup Y
10\t1\tGroup Y
11\t0\tGroup Y
13\t1\tGroup Y
14\t1\tGroup Y
15\t0\tGroup Y
16\t1\tGroup Y
18\t1\tGroup Y
19\t0\tGroup Y
21\t1\tGroup Y
24\t1\tGroup Y
26\t0\tGroup Y
30\t1\tGroup Y
34\t0\tGroup Y
38\t1\tGroup Y
42\t0\tGroup Y
46\t1\tGroup Y
50\t0\tGroup Y
60\t0\tGroup Y`,
};

const doseResponse: SampleDataset = {
  name: "Dose-Response Trial",
  description: "High dose vs Placebo, dose-dependent survival benefit",
  data: `Time\tEvent\tGroup
1\t1\tPlacebo
2\t1\tPlacebo
2\t1\tPlacebo
3\t1\tPlacebo
3\t1\tPlacebo
4\t1\tPlacebo
4\t1\tPlacebo
5\t1\tPlacebo
5\t0\tPlacebo
6\t1\tPlacebo
6\t1\tPlacebo
7\t1\tPlacebo
7\t1\tPlacebo
8\t1\tPlacebo
8\t0\tPlacebo
9\t1\tPlacebo
10\t1\tPlacebo
10\t0\tPlacebo
11\t1\tPlacebo
12\t1\tPlacebo
13\t0\tPlacebo
14\t1\tPlacebo
16\t1\tPlacebo
18\t0\tPlacebo
20\t1\tPlacebo
22\t0\tPlacebo
24\t1\tPlacebo
28\t0\tPlacebo
32\t1\tPlacebo
36\t0\tPlacebo
4\t0\tHigh Dose
6\t0\tHigh Dose
8\t1\tHigh Dose
10\t0\tHigh Dose
12\t1\tHigh Dose
12\t0\tHigh Dose
14\t1\tHigh Dose
16\t0\tHigh Dose
16\t1\tHigh Dose
18\t1\tHigh Dose
18\t0\tHigh Dose
20\t1\tHigh Dose
22\t1\tHigh Dose
22\t0\tHigh Dose
24\t1\tHigh Dose
26\t1\tHigh Dose
26\t0\tHigh Dose
28\t1\tHigh Dose
30\t1\tHigh Dose
32\t0\tHigh Dose
34\t1\tHigh Dose
36\t1\tHigh Dose
38\t0\tHigh Dose
40\t1\tHigh Dose
44\t1\tHigh Dose
48\t0\tHigh Dose
52\t1\tHigh Dose
56\t0\tHigh Dose
64\t1\tHigh Dose
72\t0\tHigh Dose`,
};

export const SAMPLE_DATASETS: SampleDataset[] = [
  lungCancer,
  heartFailure,
  reliability,
  overlapping,
  doseResponse,
];
