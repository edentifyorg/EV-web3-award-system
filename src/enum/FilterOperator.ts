export enum FilterOperator {
  EQ = 'EQ', // equals
  LK = 'LK', // like (contains)
  LT = 'LT', // less than
  GT = 'GT', // greater than
  LTE = 'LTE', // less than or equal (not greater than)
  GTE = 'GTE', // greater than or equal (not less than)
  BTIN = 'BTIN', // between inclusive (GTE AND LTE)
  BTEX = 'BTEX', // between exclusive (GT AND LT)
}
