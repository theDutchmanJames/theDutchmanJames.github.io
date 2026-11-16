// Area numbers (as shown in Livery's Prepare dialog for livery-assets/car/sports-car.eps) → part labels.
const r=(a,b)=>Array.from({length:b-a+1},(_,i)=>a+i);
module.exports={
 Windows:[35,36,39,41,44,47,51,53,54],
 Lights:[27,29,...r(56,68)],
 Wheels:[2,3,4,9,10,11,12,13,15,...r(79,96)],
 Trim:[7,8,14,16,17,18,19,20,21,22,24,25,37,38,42,43,72,73,76,77],
};
