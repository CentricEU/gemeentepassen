import { RequiredDocumentsEnum } from "../../utils/enums/required-documents.enum";
import { getRequiredEnvVar } from "../../utils/test-utils";
import { DataBase } from "../db-connection";

export async function getRequiredDocuments(): Promise<string[]> {
  const query = `
    SELECT 
        required_documents 
        FROM l4l_global.citizen_group as cg
        INNER JOIN l4l_global.citizen_group_assignment as cga on cg.id=cga.citizen_group_id
        WHERE cga.citizen_id=$1
    `;
  const queryResult = await DataBase.executeQuery<{
    required_documents: string;
  }>(query, [getRequiredEnvVar("CITIZEN_ID")]);
  let result = (queryResult[0].required_documents =
    queryResult[0].required_documents.replace(/{|}/g, ""));
  let resultList = result.split(",");
  resultList = resultList.map(
    (key) => RequiredDocumentsEnum[key as keyof typeof RequiredDocumentsEnum]
  );
  return resultList;
}
