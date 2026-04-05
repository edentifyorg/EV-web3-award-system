import { Injectable } from '@nestjs/common';
import { BaseFilterProcessor } from 'src/base-classes/base-filter-processor/base-filter-processor';

@Injectable()
export class UserFilterProcessor extends BaseFilterProcessor {
  constructor() {
    super();
  }

  public processSpecificFilter(_specificFilter: any) {
    return [];
  }
}
