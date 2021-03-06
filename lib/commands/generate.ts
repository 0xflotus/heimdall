import { DynamoDB } from "aws-sdk";
import { ParsedMail } from "mailparser";
import generate from "nanoid/generate";
import { domain, email } from "../env";
import { Commands } from "../commandSet";
import sendEmail from "../utils/sendEmail";

export default async (parsedMail: ParsedMail): Promise<void> => {
  const description = parsedMail.subject;
  const generatedAlias = generate("0123456789abcdefghijklmnopqrstuvwxyz", 13); // It is important there are no "+" symbols here
  console.log(
    `Generated alias=${generatedAlias} for description=${description}`
  );

  console.log("Attempting to store alias-description record");
  const docClient = new DynamoDB.DocumentClient();
  const docParams: DynamoDB.DocumentClient.PutItemInput = {
    TableName: "aliases",
    Item: {
      alias: generatedAlias,
      description
    }
  };

  await docClient.put(docParams).promise();
  console.log("Successfully stored alias-description record");

  await sendEmail({
    from: `${Commands.Generate}@${domain}`,
    to: [email],
    subject: `Generated alias: ${generatedAlias}`,
    text: `You have generated ${generatedAlias}@${domain} for "${description}".`
  });
};
