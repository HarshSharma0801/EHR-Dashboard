"use client";

import { useState } from "react";
import { Search, Calendar, User, Building, Filter, X } from "lucide-react";
import Button from "./ui/Button";
import Input from "./ui/Input";
import Card from "./ui/Card";
import {
  getSearchParameters,
  validateAllSearchParameters,
  type SearchParameterConfig,
} from "../lib/modmed-config";

interface SearchFormProps {
  onSearch: (params: any) => void;
  loading?: boolean;
}

export function PatientSearchForm({ onSearch, loading }: SearchFormProps) {
  const [searchParams, setSearchParams] = useState({
    family: "",
    given: "",
    active: "",
    birthdate: "",
    gender: "",
    email: "",
    phone: "",
    "address-postalcode": "",
    identifier: "",
    _lastUpdated: "",
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const filteredParams = Object.entries(searchParams).reduce(
      (acc, [key, value]) => {
        if (value.trim() !== "") {
          acc[key] = value.trim();
        }
        return acc;
      },
      {} as any
    );
    onSearch(filteredParams);
  };

  const clearForm = () => {
    setSearchParams({
      family: "",
      given: "",
      active: "",
      birthdate: "",
      gender: "",
      email: "",
      phone: "",
      "address-postalcode": "",
      identifier: "",
      _lastUpdated: "",
    });
  };

  return (
    <Card
      title="Patient Search"
      subtitle="Search for patients using FHIR parameters"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Search Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Last Name (Family)"
            placeholder="Exact match for last name"
            value={searchParams.family}
            onChange={(e) =>
              setSearchParams((prev) => ({ ...prev, family: e.target.value }))
            }
          />
          <Input
            label="First Name (Given)"
            placeholder="Portion of first name"
            value={searchParams.given}
            onChange={(e) =>
              setSearchParams((prev) => ({ ...prev, given: e.target.value }))
            }
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Active Status
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchParams.active}
              onChange={(e) =>
                setSearchParams((prev) => ({ ...prev, active: e.target.value }))
              }
            >
              <option value="">Any</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchParams.gender}
              onChange={(e) =>
                setSearchParams((prev) => ({ ...prev, gender: e.target.value }))
              }
            >
              <option value="">Any</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>
          <Input
            label="Birth Date"
            type="date"
            placeholder="YYYY-MM-DD"
            value={searchParams.birthdate}
            onChange={(e) =>
              setSearchParams((prev) => ({
                ...prev,
                birthdate: e.target.value,
              }))
            }
          />
        </div>

        {/* Advanced Search Toggle */}
        <div className="flex justify-between items-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <Filter className="w-4 h-4 mr-2" />
            {showAdvanced ? "Hide" : "Show"} Advanced Options
          </Button>

          <div className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearForm}
            >
              <X className="w-4 h-4 mr-2" />
              Clear
            </Button>
            <Button type="submit" loading={loading}>
              <Search className="w-4 h-4 mr-2" />
              Search Patients
            </Button>
          </div>
        </div>

        {/* Advanced Fields */}
        {showAdvanced && (
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Email"
                placeholder="Email address"
                value={searchParams.email}
                onChange={(e) =>
                  setSearchParams((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
              />
              <Input
                label="Phone"
                placeholder="Phone number"
                value={searchParams.phone}
                onChange={(e) =>
                  setSearchParams((prev) => ({
                    ...prev,
                    phone: e.target.value,
                  }))
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Postal Code"
                placeholder="ZIP/Postal code"
                value={searchParams["address-postalcode"]}
                onChange={(e) =>
                  setSearchParams((prev) => ({
                    ...prev,
                    "address-postalcode": e.target.value,
                  }))
                }
              />
              <Input
                label="Identifier"
                placeholder="MRN, PMS ID, or SSN"
                value={searchParams.identifier}
                onChange={(e) =>
                  setSearchParams((prev) => ({
                    ...prev,
                    identifier: e.target.value,
                  }))
                }
              />
            </div>

            <Input
              label="Last Updated (Greater Than)"
              type="datetime-local"
              placeholder="e.g., 2016-01-01T00:00:00.000Z"
              value={searchParams._lastUpdated}
              onChange={(e) =>
                setSearchParams((prev) => ({
                  ...prev,
                  _lastUpdated: e.target.value,
                }))
              }
            />
          </div>
        )}
      </form>
    </Card>
  );
}

export function AppointmentSearchForm({ onSearch, loading }: SearchFormProps) {
  const [searchParams, setSearchParams] = useState({
    patient: "",
    practitioner: "",
    status: "",
    date: "",
    location: "",
    "appointment-type": "",
    "supporting-info": "",
    _lastUpdated: "",
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const filteredParams = Object.entries(searchParams).reduce(
      (acc, [key, value]) => {
        if (value.trim() !== "") {
          acc[key] = value.trim();
        }
        return acc;
      },
      {} as any
    );
    onSearch(filteredParams);
  };

  const clearForm = () => {
    setSearchParams({
      patient: "",
      practitioner: "",
      status: "",
      date: "",
      location: "",
      "appointment-type": "",
      "supporting-info": "",
      _lastUpdated: "",
    });
  };

  return (
    <Card
      title="Appointment Search"
      subtitle="Search for appointments using FHIR parameters"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Patient ID"
            placeholder="Patient identifier"
            value={searchParams.patient}
            onChange={(e) =>
              setSearchParams((prev) => ({ ...prev, patient: e.target.value }))
            }
          />
          <Input
            label="Practitioner ID"
            placeholder="Practitioner identifier"
            value={searchParams.practitioner}
            onChange={(e) =>
              setSearchParams((prev) => ({
                ...prev,
                practitioner: e.target.value,
              }))
            }
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchParams.status}
              onChange={(e) =>
                setSearchParams((prev) => ({ ...prev, status: e.target.value }))
              }
            >
              <option value="">Any Status</option>
              <option value="booked">Booked</option>
              <option value="arrived">Arrived</option>
              <option value="cancelled">Cancelled</option>
              <option value="noshow">No Show</option>
              <option value="pending">Pending</option>
              <option value="checked-in">Checked In</option>
              <option value="fulfilled">Fulfilled</option>
            </select>
          </div>
          <Input
            label="Date"
            type="date"
            placeholder="Appointment date"
            value={searchParams.date}
            onChange={(e) =>
              setSearchParams((prev) => ({ ...prev, date: e.target.value }))
            }
          />
        </div>

        <div className="flex justify-between items-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <Filter className="w-4 h-4 mr-2" />
            {showAdvanced ? "Hide" : "Show"} Advanced Options
          </Button>

          <div className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearForm}
            >
              <X className="w-4 h-4 mr-2" />
              Clear
            </Button>
            <Button type="submit" loading={loading}>
              <Calendar className="w-4 h-4 mr-2" />
              Search Appointments
            </Button>
          </div>
        </div>

        {showAdvanced && (
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Location ID"
                placeholder="Location identifier"
                value={searchParams.location}
                onChange={(e) =>
                  setSearchParams((prev) => ({
                    ...prev,
                    location: e.target.value,
                  }))
                }
              />
              <Input
                label="Appointment Type ID"
                placeholder="Appointment type identifier"
                value={searchParams["appointment-type"]}
                onChange={(e) =>
                  setSearchParams((prev) => ({
                    ...prev,
                    "appointment-type": e.target.value,
                  }))
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Supporting Info"
                placeholder="Referring Provider or Referral Source"
                value={searchParams["supporting-info"]}
                onChange={(e) =>
                  setSearchParams((prev) => ({
                    ...prev,
                    "supporting-info": e.target.value,
                  }))
                }
              />
              <Input
                label="Last Updated"
                type="datetime-local"
                value={searchParams._lastUpdated}
                onChange={(e) =>
                  setSearchParams((prev) => ({
                    ...prev,
                    _lastUpdated: e.target.value,
                  }))
                }
              />
            </div>
          </div>
        )}
      </form>
    </Card>
  );
}

export function PractitionerSearchForm({ onSearch, loading }: SearchFormProps) {
  const [searchParams, setSearchParams] = useState({
    family: "",
    given: "",
    active: "",
    email: "",
    phone: "",
    identifier: "",
    type: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const filteredParams = Object.entries(searchParams).reduce(
      (acc, [key, value]) => {
        if (value.trim() !== "") {
          acc[key] = value.trim();
        }
        return acc;
      },
      {} as any
    );
    onSearch(filteredParams);
  };

  const clearForm = () => {
    setSearchParams({
      family: "",
      given: "",
      active: "",
      email: "",
      phone: "",
      identifier: "",
      type: "",
    });
  };

  return (
    <Card
      title="Practitioner Search"
      subtitle="Search for practitioners using FHIR parameters"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Last Name (Family)"
            placeholder="Exact match for last name"
            value={searchParams.family}
            onChange={(e) =>
              setSearchParams((prev) => ({ ...prev, family: e.target.value }))
            }
          />
          <Input
            label="First Name (Given)"
            placeholder="Portion of first name"
            value={searchParams.given}
            onChange={(e) =>
              setSearchParams((prev) => ({ ...prev, given: e.target.value }))
            }
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Active Status
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchParams.active}
              onChange={(e) =>
                setSearchParams((prev) => ({ ...prev, active: e.target.value }))
              }
            >
              <option value="">Any</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchParams.type}
              onChange={(e) =>
                setSearchParams((prev) => ({ ...prev, type: e.target.value }))
              }
            >
              <option value="">Any Type</option>
              <option value="ref">Referring Provider</option>
            </select>
          </div>
          <Input
            label="NPI Number"
            placeholder="National Provider Identifier"
            value={searchParams.identifier}
            onChange={(e) =>
              setSearchParams((prev) => ({
                ...prev,
                identifier: e.target.value,
              }))
            }
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Email"
            placeholder="Email address"
            value={searchParams.email}
            onChange={(e) =>
              setSearchParams((prev) => ({ ...prev, email: e.target.value }))
            }
          />
          <Input
            label="Phone"
            placeholder="Phone number"
            value={searchParams.phone}
            onChange={(e) =>
              setSearchParams((prev) => ({ ...prev, phone: e.target.value }))
            }
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" size="sm" onClick={clearForm}>
            <X className="w-4 h-4 mr-2" />
            Clear
          </Button>
          <Button type="submit" loading={loading}>
            <User className="w-4 h-4 mr-2" />
            Search Practitioners
          </Button>
        </div>
      </form>
    </Card>
  );
}

export function OrganizationSearchForm({ onSearch, loading }: SearchFormProps) {
  const [searchParams, setSearchParams] = useState({
    type: "",
    name: "",
    active: "",
    identifier: "",
    _lastUpdated: "",
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const filteredParams = Object.entries(searchParams).reduce(
      (acc, [key, value]) => {
        if (value.trim() !== "") {
          acc[key] = value.trim();
        }
        return acc;
      },
      {} as any
    );
    onSearch(filteredParams);
  };

  const clearForm = () => {
    setSearchParams({
      type: "",
      name: "",
      active: "",
      identifier: "",
      _lastUpdated: "",
    });
  };

  return (
    <Card
      title="Organization Search"
      subtitle="Search for organizations (Payers or Referring Institutions)"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Organization Type *
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchParams.type}
              onChange={(e) =>
                setSearchParams((prev) => ({ ...prev, type: e.target.value }))
              }
              required
            >
              <option value="">Select Type</option>
              <option value="pay">Payers</option>
              <option value="prov">Referring Institutions</option>
            </select>
          </div>
          <Input
            label="Organization Name"
            placeholder="Exact match for organization name"
            value={searchParams.name}
            onChange={(e) =>
              setSearchParams((prev) => ({ ...prev, name: e.target.value }))
            }
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Active Status
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchParams.active}
              onChange={(e) =>
                setSearchParams((prev) => ({ ...prev, active: e.target.value }))
              }
            >
              <option value="">Any</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          <Input
            label="Payer ID (for Payers)"
            placeholder="e.g., payerId|09102"
            value={searchParams.identifier}
            onChange={(e) =>
              setSearchParams((prev) => ({
                ...prev,
                identifier: e.target.value,
              }))
            }
          />
        </div>

        <div className="flex justify-between items-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <Filter className="w-4 h-4 mr-2" />
            {showAdvanced ? "Hide" : "Show"} Advanced Options
          </Button>

          <div className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearForm}
            >
              <X className="w-4 h-4 mr-2" />
              Clear
            </Button>
            <Button type="submit" loading={loading}>
              <Building className="w-4 h-4 mr-2" />
              Search Organizations
            </Button>
          </div>
        </div>

        {showAdvanced && (
          <div className="pt-4 border-t border-gray-200">
            <Input
              label="Last Updated"
              type="datetime-local"
              value={searchParams._lastUpdated}
              onChange={(e) =>
                setSearchParams((prev) => ({
                  ...prev,
                  _lastUpdated: e.target.value,
                }))
              }
            />
          </div>
        )}
      </form>
    </Card>
  );
}
