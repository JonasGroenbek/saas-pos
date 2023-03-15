import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionRepository } from './transaction.repository';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(TransactionRepository)
    public readonly transactionRepository: TransactionRepository,
  ) {}
}
