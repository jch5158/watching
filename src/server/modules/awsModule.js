import aws from "aws-sdk";

const awsModule = (() => {
  const awsModule = {
    s3: new aws.S3({
      credentials: {
        accessKeyId: process.env.AWS_ID,
        secretAccessKey: process.env.AWS_SECRET_KEY,
      },
    }),

    bucket: "devhun-watching",

    async deleteFile(fileName) {
      const params = {
        Bucket: this.bucket,
        Key: fileName,
      };

      return this.s3.deleteObject(params).promise();
    },
  };

  return awsModule;
})();

export default awsModule;
