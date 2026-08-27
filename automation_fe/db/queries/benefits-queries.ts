import { DataBase } from "../db-connection";


export async function deleteBenefitByName(benefitName: string): Promise<any> {
  const query = `
    DELETE FROM l4l_global.benefit
    WHERE name = $1`;
  const params = [benefitName];
  return await DataBase.executeQuery(query, params);
}
