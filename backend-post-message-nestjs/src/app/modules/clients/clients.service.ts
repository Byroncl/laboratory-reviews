import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Client, ClientDocument } from './schemas/client.schema';
import { CreateClientDto } from './dto/create-client.dto';

@Injectable()
export class ClientsService {
    constructor(@InjectModel(Client.name) private clientModel: Model<ClientDocument>) {}

    async create(createClientDto: CreateClientDto): Promise<Client> {
        const createdClient = new this.clientModel(createClientDto);
        return createdClient.save();
    }
}
