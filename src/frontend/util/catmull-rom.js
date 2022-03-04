/* Copyright (c) 2021-2022 Nikolas Beisemann */

module.exports = (points) => {
  const curve = [];
  const spline = (p0, p1, p2, p3) => {
    const alpha = 0.25;
    const t0 = 0;
    /* eslint-disable max-len */
    const t1 = Math.pow(Math.pow(p1[0] - p0[0], 2) + Math.pow(p1[1] - p0[1], 2), alpha) + t0;
    const t2 = Math.pow(Math.pow(p2[0] - p1[0], 2) + Math.pow(p2[1] - p1[1], 2), alpha) + t1;
    const t3 = Math.pow(Math.pow(p3[0] - p2[0], 2) + Math.pow(p3[1] - p2[1], 2), alpha) + t2;
    /* eslint-enable max-len */

    const values = [];
    let t;
    let tInc = (t2 - t1) / (p2[0] - p1[0]);
    tInc += 1e-10; // gets rid of rounding errors
    for (t = t1; tInc > 0 && t < t2; t += tInc) {
      // we only care for the y-values: we already know x
      const a1 = (t1 - t) / (t1 - t0) * p0[1] + (t - t0) / (t1 - t0) * p1[1];
      const a2 = (t2 - t) / (t2 - t1) * p1[1] + (t - t1) / (t2 - t1) * p2[1];
      const a3 = (t3 - t) / (t3 - t2) * p2[1] + (t - t2) / (t3 - t2) * p3[1];
      const b1 = (t2 - t) / (t2 - t0) * a1 + (t - t0) / (t2 - t0) * a2;
      const b2 = (t3 - t) / (t3 - t1) * a2 + (t - t1) / (t3 - t1) * a3;

      values.push((t2 - t) / (t2 - t1) * b1 + (t - t1) / (t2 - t1) * b2);
    }
    return values;
  };
  if (points.length >= 2) {
    // work on a copy to not modify the user points
    const p = [...points];
    // create anchor points in the beginning and the end
    p.sort((a, b) => a[0] - b[0]);
    p.unshift([p[0][0] - 10, 0]);
    p.push([p[p.length - 1][0] + 10, 0]);
    // build curve from splines
    let k;
    for (k = 0; k < p.length - 3; ++k) {
      const s = spline(p[k], p[k + 1], p[k + 2], p[k + 3]);
      curve.push(...s);
    }
    // compensate for the last point never being reached
    curve.push(p[p.length - 2][1]);
  }
  return curve;
};
