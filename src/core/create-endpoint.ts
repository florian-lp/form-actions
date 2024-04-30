import parseJson from "./parse-json";
import { ActionResult, SerializableArguments, isBoolean, isDate, isNumber } from "./shared";

/**
 * Creates a handler `function` which takes in a [`Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request) object and returns a [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response) object containing JSON data.
 */
export default function createEndpointFromAction<T extends SerializableArguments>(
    /**
     * A server action `function` annotated with a [`'use server'`](https://react.dev/reference/rsc/use-server) directive.
     */
    action: (arg: T) => Promise<ActionResult<T>>
) {

    return async function (req: Request) {
        let requestData: any = {}, responseData: ActionResult<T>;

        try {
            const body = await req.text();

            if (body) {
                requestData = parseJson(body);
            } else {
                const { searchParams } = new URL(req.url);

                searchParams.forEach((value, key) => {
                    switch (true) {
                        case isBoolean(value): requestData[key] = value === 'true';
                            break;
                        case isNumber(value): requestData[key] = parseFloat(value);
                            break;
                        case isDate(value): requestData[key] = new Date(value);
                            break;
                        default:
                            requestData[key] = value;
                    }
                });
            }

            responseData = await action(requestData);
        } catch (error) {
            responseData = {
                errors: {
                    unhandled: error
                }
            };
        }

        return Response.json(responseData);
    }
}