import { APIRequestContext } from "@playwright/test";
import {logger} from "../utils/logger";

class BaseApi{

    private request : APIRequestContext;

    constructor(request: APIRequestContext){
        this.request=request;
    }

    //Sends a GET request to the specified endpoint
    async get(endpoint: string, params?: Record<string, string>){
        if(params){
            endpoint+= '?';
            Object.keys(params).forEach(key => 
                endpoint+=key + '=' + params[key]+ '&'
            )
        }       
        logger.info(`Sending GET request to: ${endpoint}`);
        const response= await this.request.get(endpoint);

        if(response.ok()){
            logger.info(`GET request to ${endpoint} was successful`);
        }
        else{
            logger.error(`GET request to ${endpoint} failed with status code: ${response.status()}`);
        }

        return response;
    }

    //Sends a POST request to the specified endpoint with the provided data
    async post(endpoint:string, data:any){
        logger.info(`Sending POST request to: ${endpoint} with data: ${JSON.stringify(data)}`);
        const response= await this.request.post(endpoint, {data});

        if(response.ok()){
            logger.info(`POST request to ${endpoint} was successful`);
        }
        else{
            logger.error(`POST request to ${endpoint} failed with status code: ${response.status()}`);
        }

        return response;
    }

     //Sends a PUT request to the specified endpoint with the provided data
     async put(endpoint: string, data: any){
        logger.info(`Sending PUT request to ${endpoint} with data: ${JSON.stringify(data)}`);
        const response = await this.request.put(endpoint, {data});
 
        if(response.ok()){
            logger.info(`PUT request to ${endpoint} successful`);
        }
        else{
            logger.error(`PUT request to ${endpoint} failed with status code ${response.status()}`);
        }
        return response;
    }
 
    //Sends a DELETE request to the specified endpoint
    async delete(endpoint: string){
        logger.info(`Sending DELETE request to ${endpoint}`);
        const response = await this.request.delete(endpoint);
 
        if(response.ok()){
            logger.info(`DELETE request to ${endpoint} successful`);
        }
        else{
            logger.error(`DELETE request to ${endpoint} failed with status code ${response.status()}`);
        }
        return response;
    }
}

export default BaseApi;
