import { NextRequest, NextResponse } from "next/server";

// Type definitions for Unipile API response
interface WorkExperience {
  company_id?: string;
  company: string;
  position: string;
  location?: string;
  description?: string;
  company_picture_url?: string;
  skills?: string[];
  start: string;
  end: string | null;
}

interface Education {
  school_name?: string;
  school?: string;
  degree_name?: string;
  degree?: string;
  field_of_study?: string;
  field?: string;
  start?: string;
  end?: string;
}

interface Skill {
  name: string;
  endorsement_count: number;
  insights?: string[];
}

interface Certification {
  name: string;
  organization: string;
}

interface Language {
  name: string;
  proficiency?: string;
}

interface Recommendation {
  caption: string;
  text: string;
  actor: {
    first_name: string;
    last_name: string;
    provider_id: string;
    public_identifier: string;
    headline: string;
    public_profile_url: string;
    profile_picture_url?: string;
  };
}

interface UnipileProfileResponse {
  object: string;
  provider: string;
  provider_id: string;
  public_identifier: string;
  member_urn?: string;
  first_name: string;
  last_name: string;
  headline?: string;
  primary_locale?: {
    country: string;
    language: string;
  };
  is_open_profile: boolean;
  is_premium: boolean;
  is_influencer: boolean;
  is_creator: boolean;
  network_distance?: string;
  websites?: string[];
  follower_count?: number;
  connections_count?: number;
  location?: string;
  profile_picture_url?: string;
  profile_picture_url_large?: string;
  education_total_count: number;
  education: Education[];
  work_experience_total_count: number;
  work_experience: WorkExperience[];
  skills_total_count: number;
  skills: Skill[];
  languages_total_count: number;
  languages: Language[];
  certifications_total_count: number;
  certifications: Certification[];
  summary?: string;
  volunteering_experience_total_count: number;
  volunteering_experience: any[];
  projects_total_count: number;
  projects: any[];
  recommendations?: {
    given_total_count: number;
    given: Recommendation[];
    received_total_count: number;
    received: Recommendation[];
  };
  hashtags?: string[];
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    // Decode URL-encoded characters (e.g., %C3%A9 -> é)
    const id = decodeURIComponent(rawId);

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

    // Use the detailed profile endpoint with linkedin_sections=* for full profile data
    const response = await fetch(
      `${dsn}/api/v1/users/${encodeURIComponent(id)}?linkedin_sections=*&account_id=${accountId}`,
      {
        method: "GET",
        headers: {
          "X-API-KEY": apiKey,
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error("Unipile API error:", response.status, response.statusText);
      return NextResponse.json(
        { error: "Failed to fetch profile" },
        { status: response.status }
      );
    }

    const data: UnipileProfileResponse = await response.json();

    // Transform Unipile response to our detailed format
    const profile = {
      id: data.public_identifier || id,
      provider_id: data.provider_id,
      name: `${data.first_name} ${data.last_name}`,
      first_name: data.first_name,
      last_name: data.last_name,
      headline: data.headline || "",
      location: data.location || "",
      photo_url: data.profile_picture_url || data.profile_picture_url_large,
      photo_url_large: data.profile_picture_url_large,
      profile_url: `https://www.linkedin.com/in/${data.public_identifier}`,
      summary: data.summary || "",

      // Profile metadata
      is_premium: data.is_premium,
      is_influencer: data.is_influencer,
      is_creator: data.is_creator,
      is_open_profile: data.is_open_profile,
      network_distance: data.network_distance,
      follower_count: data.follower_count,
      connections_count: data.connections_count,
      primary_locale: data.primary_locale,
      websites: data.websites || [],

      // Work experience with full details
      work_experience_total_count: data.work_experience_total_count,
      experiences: data.work_experience.map((exp) => ({
        company_id: exp.company_id,
        company: exp.company,
        title: exp.position,
        location: exp.location || "",
        description: exp.description || "",
        company_logo: exp.company_picture_url,
        skills: exp.skills || [],
        start_date: exp.start,
        end_date: exp.end,
        is_current: exp.end === null,
      })),

      // Education
      education_total_count: data.education_total_count,
      education: data.education.map((edu) => ({
        school: edu.school_name || edu.school || "",
        degree: edu.degree_name || edu.degree || "",
        field: edu.field_of_study || edu.field || "",
        start_year: edu.start,
        end_year: edu.end,
      })),

      // Skills with endorsements
      skills_total_count: data.skills_total_count,
      skills: data.skills.map((skill) => ({
        name: skill.name,
        endorsement_count: skill.endorsement_count,
        insights: skill.insights || [],
      })),

      // Languages
      languages_total_count: data.languages_total_count,
      languages: data.languages.map((lang) => ({
        name: lang.name,
        proficiency: lang.proficiency,
      })),

      // Certifications
      certifications_total_count: data.certifications_total_count,
      certifications: data.certifications.map((cert) => ({
        name: cert.name,
        organization: cert.organization,
      })),

      // Volunteering
      volunteering_experience_total_count: data.volunteering_experience_total_count,
      volunteering: data.volunteering_experience,

      // Projects
      projects_total_count: data.projects_total_count,
      projects: data.projects,

      // Recommendations
      recommendations: data.recommendations ? {
        given_total_count: data.recommendations.given_total_count,
        given: data.recommendations.given.map((rec) => ({
          caption: rec.caption,
          text: rec.text,
          recommender: {
            name: `${rec.actor.first_name} ${rec.actor.last_name}`,
            headline: rec.actor.headline,
            profile_url: rec.actor.public_profile_url,
            photo_url: rec.actor.profile_picture_url,
          },
        })),
        received_total_count: data.recommendations.received_total_count,
        received: data.recommendations.received.map((rec) => ({
          caption: rec.caption,
          text: rec.text,
          recommender: {
            name: `${rec.actor.first_name} ${rec.actor.last_name}`,
            headline: rec.actor.headline,
            profile_url: rec.actor.public_profile_url,
            photo_url: rec.actor.profile_picture_url,
          },
        })),
      } : null,

      // Hashtags/Interests
      hashtags: data.hashtags || [],
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
