const fs = require('fs');

function baseToBigInt(value, base) {
    const digits = '0123456789abcdef';
    let result = 0n;
    const baseBig = BigInt(base);
    
    for (let i = 0; i < value.length; i++) {
        const char = value[i].toLowerCase();
        const digitValue = BigInt(digits.indexOf(char));
        result = result * baseBig + digitValue;
    }
    
    return result;
}

function modularInverse(a, mod) {
    let m0 = mod;
    let y = 0n;
    let x = 1n;
    let a0 = a;

    if (mod === 1n) return 0n;

    while (a0 > 1n) {
        let q = a0 / mod;
        let t = mod;
        mod = a0 % mod;
        a0 = t;
        t = y;
        y = x - q * y;
        x = t;
    }

    if (x < 0n) x += m0;
    return x;
}

function computeSecret(points, k, prime) {
    let secret = 0n;
    
    for (let j = 0; j < k; j++) {
        let num = 1n;
        let den = 1n;
        const xj = BigInt(points[j].x);
        const yj = BigInt(points[j].y);
        
        for (let i = 0; i < k; i++) {
            if (i !== j) {
                const xi = BigInt(points[i].x);
                num = (num * (-xi)) % prime;
                den = (den * (xj - xi)) % prime;
            }
        }
        
        num = (num % prime + prime) % prime;
        den = (den % prime + prime) % prime;
        
        const invDen = modularInverse(den, prime);
        const term = (yj * num % prime) * invDen % prime;
        secret = (secret + term) % prime;
    }
    
    return (secret % prime + prime) % prime;
}

function solveHashira(data) {
    const k = data.keys.k;
    const points = [];
    
    for (const key in data) {
        if (key !== "keys") {
            const point = data[key];
            const x = parseInt(key);
            const y = baseToBigInt(point.value, parseInt(point.base));
            points.push({ x, y });
        }
    }
    
    if (points.length < k) {
        throw new Error(`Need ${k} points but got ${points.length}`);
    }
    
    const prime = 1000000000000000003n;
    return computeSecret(points, k, prime).toString();
}

const testCase1 = {
    "keys": {"n": 4, "k": 3},
    "1": {"base": "10", "value": "4"},
    "2": {"base": "2", "value": "111"},
    "3": {"base": "10", "value": "12"},
    "6": {"base": "4", "value": "213"}
};

const testCase2 = {
    "keys": {"n": 10, "k": 7},
    "1": {"base": "6", "value": "13444211440455345511"},
    "2": {"base": "15", "value": "aed7015a346d635"},
    "3": {"base": "15", "value": "6aeeb69631c227c"},
    "4": {"base": "16", "value": "e1b5e05623d881f"},
    "5": {"base": "8", "value": "316034514573652620673"},
    "6": {"base": "3", "value": "2122212201122002221120200210011020220200"},
    "7": {"base": "3", "value": "20120221122211000100210021102001201112121"},
    "8": {"base": "6", "value": "20220554335330240002224253"},
    "9": {"base": "12", "value": "45153788322a1255483"},
    "10": {"base": "7", "value": "1101613130313526312514143"}
};

console.log("Test 1:", solveHashira(testCase1));
console.log("Test 2:", solveHashira(testCase2));
