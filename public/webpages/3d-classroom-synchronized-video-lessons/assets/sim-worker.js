self.onmessage=t=>{const{mass:e,friction:n,seed:i}=t.data,o=(i*9301+49297)%233280/233280,s=Math.max(.1,(20-e)*(1-n)*.08+o*.1),c=.5*e*s*s;self.postMessage({velocity:s,energy:c})};
