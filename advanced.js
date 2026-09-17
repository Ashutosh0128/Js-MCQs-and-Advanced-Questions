/*  1. Write a function deepClone(obj) that returns a deep copy of a nested object without using JSON.parse/JSON.stringify, handling arrays, objects, Date, and null.


2. Write a polyfill for Function.prototype.bind that supports partial arguments and works with new keyword invocation.


3. Write a debounce(fn, delay) function that preserves this and arguments, and supports a cancel method.


4. Write a throttle(fn, interval) function that executes at most once per interval, supporting leading and trailing options.


5. Implement a curry function curry(fn) that supports infinite currying and can be invoked with any number of arguments at a time.


6. Write a function flattenObject(obj) that converts a nested object into a single-level object with dot-separated keys.


7. Implement Promise.all polyfill from scratch that handles non-promise values and rejects on first rejection.


8. Write a function memoize(fn) that caches results based on arguments, with support for a custom resolver and cache clearing.


9. Implement a simple EventEmitter class with on, off, once, and emit methods that handle multiple listeners.


10. Write a function groupBy(array, keyFn) that groups array elements into an object keyed by the result of keyFn.


11. Implement a lruCache class with get and put methods with O(1) time complexity and a fixed capacity.


12. Write a function retry(fn, retries, delay) that retries a failing async function with exponential backoff.


13. Write a custom implementation of Array.prototype.map that mimics native behavior including index and array arguments.


14. Write a function that converts a callback-based function into a promise-returning function (promisify).


15. Implement a function compose(...fns) and pipe(...fns) that support both left-to-right and right-to-left composition.


16. Write a function that finds the longest substring without repeating characters and returns its length.


17. Write a function to check if two objects are deeply equal, handling arrays, dates, and circular references.


18. Write a function chunk(array, size) that splits an array into groups of a given size, returning an array of arrays.


19. Implement a function that returns the nth Fibonacci number using memoization and iterative approaches, and compare performance.


20. Write a function that serializes an object into query string parameters and a function that parses a query string back into an object, handling encoding and arrays.


*/


//1.DeepClone(obj)

function deepClone(obj) {
    if (obj === null || typeof obj !== "object") {
        return obj;
    }
    if (obj instanceof Date) {
        return new Date(obj.getTime());
    }
    if (Array.isArray(obj)) {
        return obj.map(item => deepClone(item));
    }
    const cloned = {};
    for (const key in obj) {
        if (Object.hasOwn(obj, key)) {
            cloned[key] = deepClone(obj[key]);
        }
    }

    return cloned;
}

// example

const original = {
    name: "Ash",
    skills: ["JavaScript", "Python"],
    address: {
        city: "Mumbai"
    },
    dob: new Date()
};

const copy = deepClone(original);

copy.address.city = "Pune";

console.log(original.address.city); // Mumbai
console.log(copy.address.city);    // Pune

//2.Pollyfill
Function.prototype.myBind = function(context, ...boundArgs) {
    const fn = this;

    function boundFunction(...args) {
        const isNew = this instanceof boundFunction;

        const thisArg = isNew ? this : context;

        return fn.apply(
            thisArg,
            [...boundArgs, ...args]
        );
    }

    if (fn.prototype) {
        boundFunction.prototype = Object.create(fn.prototype);
    }

    return boundFunction;
};










//3. Debounce

function debounce(fn, delay) {
    let timer;

    function debounced(...args) {
        clearTimeout(timer);

        timer = setTimeout(() => {
            fn.apply(this, args);
        }, delay);
    }

    debounced.cancel = function() {
        clearTimeout(timer);
        timer = null;
    };

    return debounced;
}











//4. Throttle
function throttle(fn, interval, options = {}) {
    let lastTime = 0;
    let timer = null;
    const leading = options.leading !== false;
    const trailing = options.trailing !== false;
    function throttled(...args) {
        const now = Date.now();
        if (!lastTime && !leading) {
            lastTime = now;
        }
        const remaining = interval - (now - lastTime);
        if (remaining <= 0) {
            if (timer) {
                clearTimeout(timer);
                timer = null;
            }
            lastTime = now;
            fn.apply(this, args);
        } else if (trailing && !timer) {
            timer = setTimeout(() => {
                lastTime = leading ? Date.now() : 0;
                timer = null;
                fn.apply(this, args);
            }, remaining);
        }
    }
    throttled.cancel = function() {
        clearTimeout(timer);
        timer = null;
        lastTime = 0;
    };
    return throttled;
}





//5. Curry Function

function curry(fn) {
    function curried(...args) {
        if (args.length >= fn.length) {
            return fn(...args);
        }

        return (...nextArgs) => {
            return curried(...args, ...nextArgs);
        };
    }

    return curried;
}








//6. Flatten Object
function flattenObject(obj, prefix = "", result = {}) {
    for (const key in obj) {
        if (!Object.hasOwn(obj, key)) continue;

        const newKey = prefix
            ? `${prefix}.${key}`
            : key;

        const value = obj[key];

        if (
            value !== null &&
            typeof value === "object" &&
            !Array.isArray(value)
        ) {
            flattenObject(value, newKey, result);
        } else {
            result[newKey] = value;
        }
    }

    return result;
}







//7. Promise.all Polyfill

function myPromiseAll(iterable) {
    return new Promise((resolve, reject) => {
        const items = Array.from(iterable);
        const results = [];
        let completed = 0;

        if (items.length === 0) {
            resolve([]);
            return;
        }

        items.forEach((item, index) => {
            Promise.resolve(item)
                .then(value => {
                    results[index] = value;
                    completed++;

                    if (completed === items.length) {
                        resolve(results);
                    }
                })
                .catch(reject);
        });
    });
}




//8. memorize 

function memoize(fn, resolver) {
    const cache = new Map();

    function memoized(...args) {
        const key = resolver
            ? resolver(...args)
            : JSON.stringify(args);

        if (cache.has(key)) {
            return cache.get(key);
        }

        const result = fn.apply(this, args);

        cache.set(key, result);

        return result;
    }

    memoized.clear = function() {
        cache.clear();
    };

    return memoized;
}




//9. EventEmitter

class EventEmitter {
    constructor() {
        this.events = {};
    }

    on(event, listener) {
        if (!this.events[event]) {
            this.events[event] = [];
        }

        this.events[event].push(listener);

        return this;
    }

    off(event, listener) {
        if (!this.events[event]) return this;

        this.events[event] =
            this.events[event].filter(fn => fn !== listener);

        return this;
    }

    once(event, listener) {
        const wrapper = (...args) => {
            this.off(event, wrapper);
            listener(...args);
        };

        return this.on(event, wrapper);
    }

    emit(event, ...args) {
        if (!this.events[event]) return false;

        this.events[event].forEach(listener => {
            listener(...args);
        });

        return true;
    }
}











//10. GroupBy

function groupBy(array, keyFn) {
    return array.reduce((result, item) => {
        const key = keyFn(item);

        if (!result[key]) {
            result[key] = [];
        }

        result[key].push(item);

        return result;
    }, {});
}





//11. LRU Cache – O(1)
class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.cache = new Map();
    }

    get(key) {
        if (!this.cache.has(key)) {
            return -1;
        }

        const value = this.cache.get(key);

        // Move to end = recently used
        this.cache.delete(key);
        this.cache.set(key, value);
        return value;
    }
    put(key, value) {
        if (this.cache.has(key)) {
            this.cache.delete(key);
        }
        this.cache.set(key, value);
        if (this.cache.size > this.capacity) {
            const oldestKey = this.cache.keys().next().value;
            this.cache.delete(oldestKey);
        }
    }
}

//12. Retry with exponential backoff

function wait(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

async function retry(fn, retries, delay) {
    let attempt = 0;

    while (true) {
        try {
            return await fn();
        } catch (error) {
            if (attempt >= retries) {
                throw error;
            }

            const backoffDelay = delay * Math.pow(2, attempt);

            await wait(backoffDelay);

            attempt++;
        }
    }
}








//13. Custom map()

Array.prototype.myMap = function(callback, thisArg) {
    if (this == null) {
        throw new TypeError("Array is null or undefined");
    }

    const array = Object(this);
    const result = new Array(array.length);

    for (let i = 0; i < array.length; i++) {
        if (i in array) {
            result[i] = callback.call(
                thisArg,
                array[i],
                i,
                array
            );
        }
    }

    return result;
};








//14. Promisify()

function promisify(fn) {
    return function(...args) {
        return new Promise((resolve, reject) => {

            fn(...args, (error, result) => {

                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }

            });
        });
    };
}












//15. Compose() and pipe()

function compose(...fns) {
    return function(value) {
        return fns.reduceRight(
            (result, fn) => fn(result),
            value
        );
    };
}

function pipe(...fns) {
    return function(value) {
        return fns.reduce(
            (result, fn) => fn(result),
            value
        );
    };
}












//16. Longest Substring without Reapting characters
function longestSubstring(str) {
    const set = new Set();

    let left = 0;
    let maxLength = 0;

    for (let right = 0; right < str.length; right++) {

        while (set.has(str[right])) {
            set.delete(str[left]);
            left++;
        }

        set.add(str[right]);

        maxLength = Math.max(
            maxLength,
            right - left + 1
        );
    }

    return maxLength;
}







//17. Deep Equality with Circular References

function deepEqual(a, b, visited = new WeakMap()) {

    if (Object.is(a, b)) {
        return true;
    }

    if (
        a === null ||
        b === null ||
        typeof a !== "object" ||
        typeof b !== "object"
    ) {
        return false;
    }

    if (a instanceof Date || b instanceof Date) {
        return (
            a instanceof Date &&
            b instanceof Date &&
            a.getTime() === b.getTime()
        );
    }

    if (Array.isArray(a) !== Array.isArray(b)) {
        return false;
    }

    // Circular reference handling
    if (visited.get(a) === b) {
        return true;
    }

    visited.set(a, b);

    const keysA = Reflect.ownKeys(a);
    const keysB = Reflect.ownKeys(b);

    if (keysA.length !== keysB.length) {
        return false;
    }

    for (const key of keysA) {

        if (!keysB.includes(key)) {
            return false;
        }

        if (!deepEqual(a[key], b[key], visited)) {
            return false;
        }
    }

    return true;
}






//18. Chunk ()

function chunk(array, size) {
    if (size <= 0) {
        throw new Error("Size must be greater than 0");
    }

    const result = [];

    for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
    }

    return result;
}















//19. Fibonacci : iterative vs memoization
1
//Iterative :

function fibonacciIterative(n) {
    if (n <= 1) {
        return n;
    }

    let a = 0;
    let b = 1;

    for (let i = 2; i <= n; i++) {
        const next = a + b;
        a = b;
        b = next;
    }

    return b;
}





//Memoization:
function fibonacciMemo() {
    const cache = new Map([
        [0, 0],
        [1, 1]
    ]);

    function fib(n) {
        if (cache.has(n)) {
            return cache.get(n);
        }

        const result = fib(n - 1) + fib(n - 2);

        cache.set(n, result);

        return result;
    }

    return fib;
}

const fibonacci = fibonacciMemo();








//20. Object – Query String

//Serialize:

function toQueryString(obj) {
    const params = new URLSearchParams();

    for (const key in obj) {
        if (!Object.hasOwn(obj, key)) continue;

        const value = obj[key];

        if (Array.isArray(value)) {
            value.forEach(item => {
                params.append(key, item);
            });
        } else if (value !== undefined && value !== null) {
            params.append(key, value);
        }
    }

    return params.toString();
}







//Parse:

function fromQueryString(query) {
    const params = new URLSearchParams(query);
    const result = {};

    for (const [key, value] of params.entries()) {

        if (result[key] === undefined) {
            result[key] = value;
        } else if (Array.isArray(result[key])) {
            result[key].push(value);
        } else {
            result[key] = [
                result[key],
                value
            ];
        }
    }

    return result;
}


