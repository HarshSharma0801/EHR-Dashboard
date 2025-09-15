"use client";

import { useState, useEffect } from "react";
import { Search, Filter, X, AlertCircle } from "lucide-react";
import Button from "./ui/Button";
import Input from "./ui/Input";
import Card from "./ui/Card";
import {
  getSearchParameters,
  validateAllSearchParameters,
  getResourceConfig,
  type SearchParameterConfig,
} from "../lib/modmed-config";

interface DynamicSearchFormProps {
  resourceType: "Patient" | "Appointment" | "Practitioner" | "Organization";
  onSearch: (params: any) => void;
  loading?: boolean;
}

const DynamicSearchField = ({
  param,
  value,
  onChange,
  error,
}: {
  param: SearchParameterConfig;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) => {
  const baseInputProps = {
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      onChange(e.target.value),
    className: error ? "border-red-500 focus:ring-red-500" : "",
  };

  switch (param.type) {
    case "select":
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {param.label}
            {param.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <select
            {...baseInputProps}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              error ? "border-red-500 focus:ring-red-500" : ""
            }`}
          >
            {param.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {error && (
            <div className="flex items-center mt-1 text-sm text-red-600">
              <AlertCircle className="w-4 h-4 mr-1" />
              {error}
            </div>
          )}
          <p className="text-xs text-gray-500 mt-1">{param.description}</p>
        </div>
      );

    case "date":
      return (
        <div>
          <Input
            label={param.label}
            type={param.name.includes("Updated") ? "datetime-local" : "date"}
            placeholder={param.placeholder}
            required={param.required}
            {...baseInputProps}
          />
          {error && (
            <div className="flex items-center mt-1 text-sm text-red-600">
              <AlertCircle className="w-4 h-4 mr-1" />
              {error}
            </div>
          )}
          <p className="text-xs text-gray-500 mt-1">{param.description}</p>
        </div>
      );

    default:
      return (
        <div>
          <Input
            label={param.label}
            placeholder={param.placeholder}
            required={param.required}
            {...baseInputProps}
          />
          {error && (
            <div className="flex items-center mt-1 text-sm text-red-600">
              <AlertCircle className="w-4 h-4 mr-1" />
              {error}
            </div>
          )}
          <p className="text-xs text-gray-500 mt-1">{param.description}</p>
        </div>
      );
  }
};

export default function DynamicModMedSearchForm({
  resourceType,
  onSearch,
  loading,
}: DynamicSearchFormProps) {
  const [searchParams, setSearchParams] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  const resourceConfig = getResourceConfig(resourceType);
  const parameters = getSearchParameters(resourceType);

  // Split parameters into basic and advanced
  const basicParams = parameters.slice(0, 4); // First 4 are basic
  const advancedParams = parameters.slice(4); // Rest are advanced

  useEffect(() => {
    // Reset form when resource type changes
    setSearchParams({});
    setErrors({});
    setShowAdvanced(false);
  }, [resourceType]);

  const handleParamChange = (paramName: string, value: string) => {
    setSearchParams((prev) => ({
      ...prev,
      [paramName]: value,
    }));

    // Clear error when user starts typing
    if (errors[paramName]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[paramName];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all parameters
    const validationErrors = validateAllSearchParameters(
      resourceType,
      searchParams
    );

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Filter out empty parameters
    const filteredParams = Object.entries(searchParams).reduce(
      (acc, [key, value]) => {
        if (value.trim() !== "") {
          acc[key] = value.trim();
        }
        return acc;
      },
      {} as Record<string, string>
    );

    onSearch(filteredParams);
  };

  const clearForm = () => {
    setSearchParams({});
    setErrors({});
  };

  const getIcon = () => {
    switch (resourceType) {
      case "Patient":
        return <Search className="w-4 h-4 mr-2" />;
      case "Appointment":
        return <Search className="w-4 h-4 mr-2" />;
      case "Practitioner":
        return <Search className="w-4 h-4 mr-2" />;
      case "Organization":
        return <Search className="w-4 h-4 mr-2" />;
      default:
        return <Search className="w-4 h-4 mr-2" />;
    }
  };

  if (!resourceConfig) {
    return (
      <Card title="Error">
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-600">Unknown resource type: {resourceType}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card
      title={`${resourceConfig.displayName} Search`}
      subtitle={`Search for ${resourceConfig.description.toLowerCase()} using FHIR parameters`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Search Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {basicParams.map((param) => (
            <DynamicSearchField
              key={param.name}
              param={param}
              value={searchParams[param.name] || ""}
              onChange={(value) => handleParamChange(param.name, value)}
              error={errors[param.name]}
            />
          ))}
        </div>

        {/* Advanced Search Toggle */}
        {advancedParams.length > 0 && (
          <div className="flex justify-between items-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <Filter className="w-4 h-4 mr-2" />
              {showAdvanced ? "Hide" : "Show"} Advanced Options (
              {advancedParams.length})
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
                {getIcon()}
                Search {resourceConfig.displayName}
              </Button>
            </div>
          </div>
        )}

        {/* Submit buttons for forms without advanced options */}
        {advancedParams.length === 0 && (
          <div className="flex justify-end space-x-2">
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
              {getIcon()}
              Search {resourceConfig.displayName}
            </Button>
          </div>
        )}

        {/* Advanced Fields */}
        {showAdvanced && advancedParams.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">
              Advanced Search Options
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {advancedParams.map((param) => (
                <DynamicSearchField
                  key={param.name}
                  param={param}
                  value={searchParams[param.name] || ""}
                  onChange={(value) => handleParamChange(param.name, value)}
                  error={errors[param.name]}
                />
              ))}
            </div>
          </div>
        )}

        {/* Display validation errors summary */}
        {Object.keys(errors).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <h4 className="text-sm font-medium text-red-800">
                Please fix the following errors:
              </h4>
            </div>
            <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
              {Object.entries(errors).map(([field, error]) => (
                <li key={field}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </form>
    </Card>
  );
}
