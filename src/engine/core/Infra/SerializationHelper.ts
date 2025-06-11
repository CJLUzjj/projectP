export class SerializationHelper {
    static stringify(obj: any): string {
        return JSON.stringify(obj, this.replacer);
    }

    static parse(json: string): any {
        return JSON.parse(json, this.reviver);
    }

    private static replacer(key: string, value: any): any {
        if (value instanceof Map) {
            return {
                __type: 'Map',
                __data: Array.from(value.entries())
            };
        }
        if (value instanceof Set) {
            return {
                __type: 'Set',
                __data: Array.from(value)
            };
        }
        if (value instanceof Date) {
            return {
                __type: 'Date',
                __data: value.toISOString()
            };
        }
        return value;
    }

    private static reviver(key: string, value: any): any {
        if (typeof value === 'object' && value !== null) {
            // 处理特殊类型标记
            if (value.__type) {
                switch (value.__type) {
                    case 'Map':
                        return new Map(value.__data);
                    case 'Set':
                        return new Set(value.__data);
                    case 'Date':
                        return new Date(value.__data);
                    default:
                        return value;
                }
            }
        }
        
        // 处理看起来像 ISO 日期字符串的值
        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/.test(value)) {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
                return date;
            }
        }
        
        return value;
    }
} 