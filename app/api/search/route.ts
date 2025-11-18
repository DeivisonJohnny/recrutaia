import { NextRequest, NextResponse } from "next/server";

/**
 * Unified handler for LinkedIn search proxy.
 * Supports:
 *   - POST: body { url: string }
 *   - GET:  query params `profession`, `location`, `technologies` OR `url`
 */
export async function GET(request: NextRequest) {
  return handleRequest(request);
}

export async function POST(request: NextRequest) {
  return handleRequest(request);
}

async function handleRequest(request: NextRequest) {
  try {
    // Extract search parameters from body (POST) or query (GET)
    let keywords: string = "";
    let location: string = "";

    if (request.method === "POST") {
      const body = await request.json();
      keywords = body.keywords || "";
      location = body.location || "";
    } else {
      const profession = request.nextUrl.searchParams.get("profession") ?? "";
      location = request.nextUrl.searchParams.get("location") ?? "";
      const technologies = request.nextUrl.searchParams.get("technologies") ?? "";
      keywords = [profession, technologies].filter(Boolean).join(" ");
    }

    if (!keywords && !location) {
      return NextResponse.json(
        { error: "Missing search keywords or location" },
        { status: 400 }
      );
    }

    const dsn = process.env.DSN;
    const accountId = process.env.ACCOUNT_ID;
    const apiKey = process.env.API_KEY;

    if (!dsn || !accountId || !apiKey) {
      console.error("Missing DSN configuration");
      return NextResponse.json(
        { error: "Server configuration missing" },
        { status: 500 }
      );
    }

    // Step 1: Get location ID if location is provided
    let locationIds: number[] = [];
    if (location) {
      const locationResponse = await fetch(
        `${dsn}/api/v1/linkedin/search/parameters?account_id=${accountId}&type=LOCATION&keywords=${encodeURIComponent(location)}&limit=1`,
        {
          method: "GET",
          headers: {
            "X-API-KEY": apiKey,
            Accept: "application/json",
          },
        }
      );

      if (locationResponse.ok) {
        const locationData = await locationResponse.json();
        if (locationData.items && locationData.items.length > 0) {
          locationIds = [parseInt(locationData.items[0].id)];
        }
      }
    }

    // Step 2: Perform the search with location IDs
    const searchBody: {
      api: string;
      category: string;
      keywords?: string;
      location?: number[];
    } = {
      api: "classic",
      category: "people",
    };

    if (keywords) {
      searchBody.keywords = keywords;
    }

    if (locationIds.length > 0) {
      searchBody.location = locationIds;
    }

    const response = await fetch(
      `${dsn}/api/v1/linkedin/search?account_id=${accountId}`,
      {
        method: "POST",
        headers: {
          "X-API-KEY": apiKey,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(searchBody),
      }
    );

    const data = await response.json();

    // Transform the response to match frontend expectations
    if (data.items) {
      const profiles = data.items.map((item: {
        id: string;
        name: string;
        headline?: string;
        location?: string;
        profile_picture_url?: string;
        profile_url?: string;
        public_identifier?: string;
      }) => ({
        id: item.public_identifier || item.id,
        name: item.name,
        headline: item.headline || '',
        location: item.location,
        photo_url: item.profile_picture_url,
        profile_url: item.profile_url ||
          (item.public_identifier
            ? `https://www.linkedin.com/in/${item.public_identifier}`
            : null),
      }));

      return NextResponse.json({
        profiles,
        paging: data.paging,
        cursor: data.cursor,
      }, { status: response.status });
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
