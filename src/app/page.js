import Image from "next/image";
import ConnectGithubButton from "@/MainComp/ConnectGithubButton";

export default function Home() {
  // console.log(process.env.GITHUB_CLIENT_ID, "client id is here")
  // console.log(process.env.GITHUB_CLIENT_ID, "client id is here")


  return (
    <>
      <div>Helllo</div>
      <ConnectGithubButton />
    </>
  );
}
