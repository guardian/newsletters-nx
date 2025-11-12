
// interface for a query params object - not exported from express
interface ParsedQs {
    [key: string]: undefined | string | string[] | ParsedQs | ParsedQs[];
}
type QueryParam = undefined | string | string[] | ParsedQs | ParsedQs[]

export const queryParamToBoolean = (value?: QueryParam) => {
    return typeof value === 'string' && value.toLowerCase() === 'true'
}
