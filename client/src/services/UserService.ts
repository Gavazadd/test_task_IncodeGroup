import $api from "../http";
import {AxiosResponse} from 'axios';
import {IUser} from "../models/IUser";

export default class UserService {
    static async fetchUsers(role: string, userId: string): Promise<AxiosResponse<IUser[]>> {
        return $api.get<IUser[]>('/users', {params: {role, userId}})
    }


    static async fetchFreeUsers(): Promise<AxiosResponse<IUser[]>> {
        return $api.get<IUser[]>('/freeUsers')
    }

    static async makeSubordinated(bossId: string, userId:string){
        return $api.post('/subordinate', {bossId, userId})
    }

}