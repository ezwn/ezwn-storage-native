import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from "react";

const undefinedAsyncProvider = async () => undefined;

const createRecord = (content, date = new Date()) => ({
    content,
    date
});

const importRecord = data => {
    if (!data) {
        return undefined;
    }

    if (data.date) {
        return {
            ...data,
            date: new Date(data.date)
        };
    }

    return createRecord(data);
};

const JSONAsyncStorage = (
    key,
    defaultProvider = undefinedAsyncProvider
) => ({
    get: async () => {
        const record = await AsyncStorage.getItem(key);
        return record
            ? importRecord(JSON.parse(record)).content
            : defaultProvider();
    },
    set: async (content) => {
        const record = createRecord(content);
        await AsyncStorage.setItem(key, JSON.stringify(record));
        return record.content;
    },
    key: () => key
});

export const useStorage = (key, defaultProvider) => {

    const storage = new JSONAsyncStorage(key, defaultProvider)

    const [state, setState] = useState(defaultProvider);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        async function fetch() {
            setState(await storage.get());
            setLoaded(true);
        }
        fetch();
    }, [key]);

    async function set(newState) {
        setState(await storage.set(newState));
    }

    return [state, set, loaded];
}
