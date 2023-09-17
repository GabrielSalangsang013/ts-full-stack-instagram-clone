export default function deepCopy<T>(obj: T): T {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }
  
    if (Array.isArray(obj)) {
      return obj.map(deepCopy) as any;
    }
  
    const newObj: any = {};
    for (const key in obj) {
      newObj[key] = deepCopy(obj[key]);
    }
    return newObj as T;
}