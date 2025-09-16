const fs = require('fs');

// Function to convert a number from any base to base 10 (decimal) using BigInt
function convertToDecimal(value, base) {
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

// Function to compute modular inverse using Extended Euclidean Algorithm
function modInverse(a, mod) {
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

    if (x < 0n) {
        x += m0;
    }

    return x;
}

// Modular exponentiation (a^b mod m)
function modExp(a, b, m) {
    let result = 1n;
    a = a % m;
    
    while (b > 0n) {
        if (b % 2n === 1n) {
            result = (result * a) % m;
        }
        a = (a * a) % m;
        b = b / 2n;
    }
    
    return result;
}

// Lagrange interpolation at x = 0 using modular arithmetic
function lagrangeAtZeroModular(points, k, modulus) {
    let result = 0n;

    for (let i = 0; i < k; i++) {
        let numerator = 1n;
        let denominator = 1n;
        const x_i = BigInt(points[i].x);
        const y_i = BigInt(points[i].y);

        for (let j = 0; j < k; j++) {
            if (i !== j) {
                const x_j = BigInt(points[j].x);
                numerator = (numerator * (-x_j)) % modulus;
                denominator = (denominator * (x_i - x_j)) % modulus;
            }
        }

        // Handle negative values
        numerator = (numerator % modulus + modulus) % modulus;
        denominator = (denominator % modulus + modulus) % modulus;

        const inv_denominator = modInverse(denominator, modulus);
        let term = (y_i * numerator) % modulus;
        term = (term * inv_denominator) % modulus;
        
        result = (result + term) % modulus;
    }

    return (result % modulus + modulus) % modulus; // Ensure positive result
}

// Load and process a test case
function processTestCase(testCase) {
    try {
        const k = testCase.keys.k;
        const points = [];

        // Collect all available points
        for (const key in testCase) {
            if (key !== "keys") {
                const { base, value } = testCase[key];
                const x = parseInt(key);
                const y = convertToDecimal(value, parseInt(base));
                points.push({ x, y });
            }
        }

        // We need at least k points
        if (points.length < k) {
            throw new Error(`Need at least ${k} points, but only got ${points.length}`);
        }

        // Use a large prime modulus (should be larger than any expected result)
        // For cryptographic applications, this would be provided in the problem
        const modulus = 1000000000000000003n; // A large prime

        const constantTerm = lagrangeAtZeroModular(points, k, modulus);
        return constantTerm.toString();

    } catch (err) {
        console.error('Error processing test case:', err.message);
        return null;
    }
}

// Test cases
const testCase1 = {
    "keys": {
        "n": 4,
        "k": 3
    },
    "1": {
        "base": "10",
        "value": "4"
    },
    "2": {
        "base": "2",
        "value": "111"
    },
    "3": {
        "base": "10",
        "value": "12"
    },
    "6": {
        "base": "4",
        "value": "213"
    }
};

const testCase2 = {
    "keys": {
        "n": 10,
        "k": 7
    },
    "1": {
        "base": "6",
        "value": "13444211440455345511"
    },
    "2": {
        "base": "15",
        "value": "aed7015a346d635"
    },
    "3": {
        "base": "15",
        "value": "6aeeb69631c227c"
    },
    "4": {
        "base": "16",
        "value": "e1b5e05623d881f"
    },
    "5": {
        "base": "8",
        "value": "316034514573652620673"
    },
    "6": {
        "base": "3",
        "value": "2122212201122002221120200210011020220200"
    },
    "7": {
        "base": "3",
        "value": "20120221122211000100210021102001201112121"
    },
    "8": {
        "base": "6",
        "value": "20220554335330240002224253"
    },
    "9": {
        "base": "12",
        "value": "45153788322a1255483"
    },
    "10": {
        "base": "7",
        "value": "1101613130313526312514143"
    }
};

// Process test cases
console.log("Processing Test Case 1:");
const result1 = processTestCase(testCase1);
console.log("Constant term (P(0)):", result1);
console.log('-----------------------------');

console.log("Processing Test Case 2:");
const result2 = processTestCase(testCase2);
console.log("Constant term (P(0)):", result2);
console.log('-----------------------------');

// Function to process from file (if needed)
function processFromFile(filePath) {
    try {
        const rawData = fs.readFileSync(filePath);
        const testCase = JSON.parse(rawData);
        return processTestCase(testCase);
    } catch (err) {
        console.error(`Error reading file ${filePath}:`, err.message);
        return null;
    }
}

// Export functions for use in other modules
module.exports = {
    convertToDecimal,
    modInverse,
    lagrangeAtZeroModular,
    processTestCase,
    processFromFile
};