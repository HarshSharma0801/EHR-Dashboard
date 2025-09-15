import { NextRequest, NextResponse } from "next/server";
import ModMedAPI from "@/app/lib/modmed-api";
import { apiCache } from "@/app/lib/api-cache";


const modmedAPI = new ModMedAPI({
  baseUrl: process.env.MODMED_BASE_URL!,
  firmPrefix: process.env.MODMED_FIRM_PREFIX!,
  apiKey: process.env.MODMED_API_KEY!,
  username: process.env.MODMED_USERNAME!,
  password: process.env.MODMED_PASSWORD!,
});

function buildSearchParams(
  searchParams: URLSearchParams,
  resourceType: string
) {
  const params: any = {};

  switch (resourceType) {
    case "Patient":
      if (searchParams.get("family"))
        params.family = searchParams.get("family");
      if (searchParams.get("given")) params.given = searchParams.get("given");
      if (searchParams.get("active"))
        params.active = searchParams.get("active");
      if (searchParams.get("birthdate"))
        params.birthdate = searchParams.get("birthdate");
      if (searchParams.get("gender"))
        params.gender = searchParams.get("gender");
      if (searchParams.get("email")) params.email = searchParams.get("email");
      if (searchParams.get("phone")) params.phone = searchParams.get("phone");
      if (searchParams.get("address-postalcode"))
        params["address-postalcode"] = searchParams.get("address-postalcode");
      if (searchParams.get("identifier"))
        params.identifier = searchParams.get("identifier");
      if (searchParams.get("_lastUpdated"))
        params._lastUpdated = searchParams.get("_lastUpdated");
      break;

    case "Appointment":
      // Appointment search parameters
      if (searchParams.get("patient"))
        params.patient = searchParams.get("patient");
      if (searchParams.get("practitioner"))
        params.practitioner = searchParams.get("practitioner");
      if (searchParams.get("status"))
        params.status = searchParams.get("status");
      if (searchParams.get("date")) params.date = searchParams.get("date");
      if (searchParams.get("location"))
        params.location = searchParams.get("location");
      if (searchParams.get("appointment-type"))
        params["appointment-type"] = searchParams.get("appointment-type");
      if (searchParams.get("supporting-info"))
        params["supporting-info"] = searchParams.get("supporting-info");
      if (searchParams.get("_lastUpdated"))
        params._lastUpdated = searchParams.get("_lastUpdated");
      break;

    case "Practitioner":
      // Practitioner search parameters
      if (searchParams.get("family"))
        params.family = searchParams.get("family");
      if (searchParams.get("given")) params.given = searchParams.get("given");
      if (searchParams.get("active"))
        params.active = searchParams.get("active");
      if (searchParams.get("email")) params.email = searchParams.get("email");
      if (searchParams.get("phone")) params.phone = searchParams.get("phone");
      if (searchParams.get("identifier"))
        params.identifier = searchParams.get("identifier");
      if (searchParams.get("type")) params.type = searchParams.get("type");
      break;

    case "Organization":
      // Organization search parameters
      if (searchParams.get("type")) params.type = searchParams.get("type");
      if (searchParams.get("name")) params.name = searchParams.get("name");
      if (searchParams.get("active"))
        params.active = searchParams.get("active");
      if (searchParams.get("identifier"))
        params.identifier = searchParams.get("identifier");
      if (searchParams.get("_lastUpdated"))
        params._lastUpdated = searchParams.get("_lastUpdated");
      break;
  }

  return params;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    switch (action) {
      case "test":
        const result = await modmedAPI.testConnection();
        return NextResponse.json(result);

      case "search-patients":
        const patientSearchParams = buildSearchParams(searchParams, "Patient");
        const patientCacheKey = `modmed-patients-${JSON.stringify(
          patientSearchParams
        )}`;

        let cachedPatients = apiCache.get(patientCacheKey);
        if (cachedPatients) {
          return NextResponse.json(cachedPatients);
        }

        const patientResult = await modmedAPI.searchPatients(patientSearchParams);
        if (patientResult.success) {
          apiCache.set(patientCacheKey, patientResult, 5);
        }
        return NextResponse.json(patientResult);

      case "search-appointments":
        const appointmentSearchParams = buildSearchParams(
          searchParams,
          "Appointment"
        );
        const appointmentCacheKey = `modmed-appointments-${JSON.stringify(
          appointmentSearchParams
        )}`;

        let cachedAppointments = apiCache.get(appointmentCacheKey);
        if (cachedAppointments) {
          return NextResponse.json(cachedAppointments);
        }

        const appointmentResult = await modmedAPI.searchAppointments(appointmentSearchParams);
        if (appointmentResult.success) {
          apiCache.set(appointmentCacheKey, appointmentResult, 5);
        }
        return NextResponse.json(appointmentResult);

      case "search-practitioners":
        const practitionerSearchParams = buildSearchParams(
          searchParams,
          "Practitioner"
        );
        const practitionerCacheKey = `modmed-practitioners-${JSON.stringify(
          practitionerSearchParams
        )}`;

        let cachedPractitioners = apiCache.get(practitionerCacheKey);
        if (cachedPractitioners) {
          return NextResponse.json(cachedPractitioners);
        }

        const practitionerResult = await modmedAPI.searchPractitioners(practitionerSearchParams);
        if (practitionerResult.success) {
          apiCache.set(practitionerCacheKey, practitionerResult, 5);
        }
        return NextResponse.json(practitionerResult);

      case "search-organizations":
        const organizationSearchParams = buildSearchParams(
          searchParams,
          "Organization"
        );
        const organizationCacheKey = `modmed-organizations-${JSON.stringify(
          organizationSearchParams
        )}`;

        let cachedOrganizations = apiCache.get(organizationCacheKey);
        if (cachedOrganizations) {
          return NextResponse.json(cachedOrganizations);
        }

        const organizationResult = await modmedAPI.searchOrganizations(organizationSearchParams);
        if (organizationResult.success) {
          apiCache.set(organizationCacheKey, organizationResult, 5);
        }
        return NextResponse.json(organizationResult);

      case "patient":
        const patientId = searchParams.get("id");
        if (!patientId) {
          return NextResponse.json({
            success: false,
            error: "Patient ID required",
          });
        }
        return NextResponse.json(await modmedAPI.getPatient(patientId));

      case "appointment":
        const appointmentId = searchParams.get("id");
        if (!appointmentId) {
          return NextResponse.json({
            success: false,
            error: "Appointment ID required",
          });
        }
        return NextResponse.json(await modmedAPI.getAppointment(appointmentId));

      case "practitioner":
        const practitionerId = searchParams.get("id");
        if (!practitionerId) {
          return NextResponse.json({
            success: false,
            error: "Practitioner ID required",
          });
        }
        return NextResponse.json(await modmedAPI.getPractitioner(practitionerId));

      case "organization":
        const organizationId = searchParams.get("id");
        if (!organizationId) {
          return NextResponse.json({
            success: false,
            error: "Organization ID required",
          });
        }
        return NextResponse.json(await modmedAPI.getOrganization(organizationId));

      default:
        return NextResponse.json({ success: false, error: "Invalid action" });
    }
  } catch (error: any) {
    console.error("ModMed API error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

