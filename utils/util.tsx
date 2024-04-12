export function cap(str: string | null): string | null{
    if (str === null || str === undefined || str.length === 0) {
        return null;
    }
    let result = str[0].toUpperCase();
    for (let i = 1; i < str.length; i++) {
        result += str[i - 1] === ' ' ? str[i].toUpperCase() : str[i].toLowerCase();
    }
    return result;
}