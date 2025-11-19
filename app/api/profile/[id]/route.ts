import { NextRequest, NextResponse } from "next/server";

// Type definitions for Scrapingdog API response (approximate based on common scraper output)
// We will map this to the frontend's expected structure.
interface ScrapingdogProfile {
  public_identifier?: string;
  profile_id?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  headline?: string;
  location?: string;
  summary?: string;
  profile_pic_url?: string;
  background_cover_image_url?: string;
  follower_count?: number;
  connection_count?: number;
  country_full_name?: string;
  occupation?: string;
  experiences?: any[];
  education?: any[];
  skills?: any[];
  languages?: any[];
  certifications?: any[];
  volunteering?: any[];
  recommendations?: any[];
  similar_profiles?: any[];
  articles?: any[];
  groups?: any[];
  people_also_viewed?: any[];
  activities?: any[];
  similarly_named_profiles?: any[];
  [key: string]: any; // Allow extra fields
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    // Decode URL-encoded characters (e.g., %C3%A9 -> é)
    const id = decodeURIComponent(rawId);

    const apiKey =
      process.env.SCRAPINGDOG_API_KEY || "691de0abaeb1455d9689ac05"; // Fallback to example key

    if (!apiKey) {
      console.error("Missing SCRAPINGDOG_API_KEY configuration");
      return NextResponse.json(
        { error: "Server configuration missing" },
        { status: 500 }
      );
    }

    const queryParams = new URLSearchParams({
      api_key: apiKey,
      id: id, // Use id parameter with just the profile identifier
      type: "profile",
      premium: "true",
      webhook: "false",
      fresh: "false",
    });

    const apiUrl = `https://api.scrapingdog.com/profile?${queryParams.toString()}`;

    console.log(`Fetching profile from Scrapingdog: ${id}`);
    console.log(`Scrapingdog URL: ${apiUrl.replace(apiKey, "HIDDEN_KEY")}`); // Log URL for debugging

    const response = await fetch(apiUrl);

    if (!response.ok) {
      console.error(
        "Scrapingdog API error:",
        response.status,
        response.statusText
      );
      return NextResponse.json(
        { error: "Failed to fetch profile" },
        { status: response.status }
      );
    }

    const responseData = await response.json();
    console.log("Scrapingdog response data:", JSON.stringify(responseData, null, 2));

    // API returns an array, get the first element
    const data: ScrapingdogProfile = Array.isArray(responseData) ? responseData[0] : responseData;

    if (!data) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    // Parse followers/connections from strings like "332 followers" -> 332
    const parseCount = (str: string | number | undefined): number => {
      if (typeof str === 'number') return str;
      if (typeof str === 'string') {
        const match = str.match(/(\d+)/);
        return match ? parseInt(match[1]) : 0;
      }
      return 0;
    };

    // Transform Scrapingdog response to our detailed format
    // Note: We map available fields. Some fields might be missing compared to Unipile.
    const profile = {
      id: data.public_identifier || data.profile_id || id,
      provider_id: "scrapingdog",
      name: data.fullName || data.full_name || `${data.first_name || ''} ${data.last_name || ''}`.trim(),
      first_name: data.first_name || "",
      last_name: data.last_name || "",
      headline: data.headline || data.occupation || "",
      location: data.location || data.country_full_name || "",
      photo_url: data.profile_photo || data.profile_pic_url,
      photo_url_large: data.profile_photo || data.profile_pic_url,
      profile_url: `https://www.linkedin.com/in/${
        data.public_identifier || id
      }`,
      summary: data.about || data.summary || "",

      // Profile metadata
      is_premium: false, // Not typically returned
      is_influencer: false,
      is_creator: false,
      is_open_profile: false,
      network_distance: "",
      follower_count: parseCount(data.followers) || data.follower_count || 0,
      connections_count: parseCount(data.connections) || data.connection_count || 0,
      primary_locale: {
        country: data.country_full_name || "",
        language: "",
      },
      websites: [], // Often not structured in simple scraping

      // Work experience
      work_experience_total_count: data.experience?.length || data.experiences?.length || 0,
      experiences: (data.experience || data.experiences || []).map((exp: any) => ({
        company_id: exp.company_id || "",
        company: exp.company_name || exp.company || "",
        title: exp.title || exp.position || "",
        location: exp.location || "",
        description: exp.description || "",
        company_logo: exp.company_image || exp.company_logo_url,
        skills: [],
        start_date: exp.start_date || parseDate(exp.starts_at),
        end_date: exp.end_date || parseDate(exp.ends_at),
        is_current: !exp.ends_at && !exp.end_date,
      })),

      // Education
      education_total_count: data.education?.length || 0,
      education: (data.education || []).map((edu: any) => ({
        school: edu.school || edu.school_name || "",
        degree: edu.degree_name || edu.degree || "",
        field: edu.field_of_study || edu.field || "",
        start_year: edu.start_year || parseYear(edu.starts_at),
        end_year: edu.end_year || parseYear(edu.ends_at),
      })),

      // Skills
      skills_total_count: data.skills?.length || 0,
      skills: (data.skills || []).map((skill: any) => ({
        name: typeof skill === "string" ? skill : skill.name,
        endorsement_count: 0,
        insights: [],
      })),

      // Languages
      languages_total_count: data.languages?.length || 0,
      languages: (data.languages || []).map((lang: any) => ({
        name: typeof lang === "string" ? lang : lang.name,
        proficiency: lang.proficiency || "",
      })),

      // Certifications
      certifications_total_count: data.certification?.length || data.certifications?.length || 0,
      certifications: (data.certification || data.certifications || []).map((cert: any) => ({
        name: cert.certification || cert.title || cert.name,
        organization: cert.company_name || cert.authority || cert.organization,
      })),

      // Volunteering
      volunteering_experience_total_count: data.volunteering?.length || 0,
      volunteering: data.volunteering || [],

      // Projects
      projects_total_count: data.projects?.length || 0,
      projects: (data.projects || []).map((proj: any) => ({
        title: proj.title || "",
        description: proj.description || "",
        duration: proj.duration || "",
      })),

      // Recommendations
      recommendations: data.recommendations || null,

      // Hashtags/Interests
      hashtags: [],
    };

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper to parse dates if needed
function parseDate(dateObj: any): string | null {
  if (!dateObj) return null;
  if (typeof dateObj === "string") return dateObj;
  const { year, month, day } = dateObj;
  if (year) return `${year}-${month || 1}-${day || 1}`;
  return null;
}

function parseYear(dateObj: any): number | undefined {
  if (!dateObj) return undefined;
  if (typeof dateObj === "string") return parseInt(dateObj) || undefined;
  return dateObj.year;
}
