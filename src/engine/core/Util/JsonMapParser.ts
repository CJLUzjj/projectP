

/**
 * JSON到Map解析器的配置接口
 */
export interface JsonMapParserConfig<K, V> {
    /**
     * 键转换函数，将JSON中的键转换为目标Map的键类型
     * @param key JSON中的键
     * @returns 转换后的键
     */
    keyConverter: (key: string) => K;
    
    /**
     * 值转换函数，将JSON中的值转换为目标Map的值类型
     * @param value JSON中的值
     * @param key 原始键
     * @returns 转换后的值
     */
    valueConverter: (value: any, key: string) => V;
}

/**
 * JSON到Map的同步解析器类
 */
export class JsonMapParser<K, V> {
    private config: JsonMapParserConfig<K, V>;

    constructor(config: JsonMapParserConfig<K, V>) {
        this.config = config;
    }

    /**
     * 解析JSON对象为Map
     * @param jsonData JSON对象
     * @returns 解析后的Map对象
     */
    parse(jsonData: Record<string, any>): Map<K, V> {
        const resultMap = new Map<K, V>();

        for (const [key, value] of Object.entries(jsonData)) {
            const convertedKey = this.config.keyConverter(key);
            const convertedValue = this.config.valueConverter(value, key);
            resultMap.set(convertedKey, convertedValue);
        }

        return resultMap;
    }

    /**
     * 从JSON对象加载并解析为Map
     * @param jsonData JSON对象
     * @returns 解析后的Map对象
     */
    static fromJson<K, V>(
        jsonData: Record<string, any>, 
        config: JsonMapParserConfig<K, V>
    ): Map<K, V> {
        const parser = new JsonMapParser(config);
        return parser.parse(jsonData);
    }

    /**
     * 从JSON字符串解析为Map
     * @param jsonString JSON字符串
     * @returns 解析后的Map对象
     */
    static fromString<K, V>(
        jsonString: string, 
        config: JsonMapParserConfig<K, V>
    ): Map<K, V> {
        const parser = new JsonMapParser(config);
        const jsonData = JSON.parse(jsonString);
        return parser.parse(jsonData);
    }
} 