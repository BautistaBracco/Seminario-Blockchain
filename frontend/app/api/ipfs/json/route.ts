import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const jwt = process.env.PINATA_JWT!;
    const url = "https://api.pinata.cloud/pinning/pinJSONToIPFS";

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const json = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: json.error || "Error al subir JSON" },
        { status: 500 },
      );
    }

    const cid = json.IpfsHash;

    return NextResponse.json({ cid });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}
