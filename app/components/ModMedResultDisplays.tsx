"use client";

import { useState } from "react";
import {
  User,
  Calendar,
  Building,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  Copy,
  ExternalLink,
} from "lucide-react";
import Card from "./ui/Card";
import Button from "./ui/Button";

interface ResultDisplayProps {
  data: any[];
  loading?: boolean;
  onViewDetails?: (item: any) => void;
  onEdit?: (item: any) => void;
}

export function PatientResultDisplay({
  data,
  loading,
  onViewDetails,
  onEdit,
}: ResultDisplayProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) {
    return (
      <Card title="Patient Search Results" className="animate-pulse">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </Card>
    );
  }

  if (!data.length) {
    return (
      <Card title="Patient Search Results">
        <div className="text-center py-8">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            No patients found. Try adjusting your search criteria.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card title={`Patient Search Results (${data.length})`}>
      <div className="space-y-4">
        {data.map((entry, index) => {
          const patient = entry.resource || entry;
          const id = patient.id || `patient-${index}`;
          const isExpanded = expandedItems.has(id);

          const name = patient.name?.[0]
            ? `${patient.name[0].given?.join(" ") || ""} ${
                patient.name[0].family || ""
              }`.trim()
            : "Unknown Patient";

          const primaryEmail = patient.telecom?.find(
            (t: any) => t.system === "email"
          )?.value;
          const primaryPhone = patient.telecom?.find(
            (t: any) => t.system === "phone"
          )?.value;
          const primaryAddress = patient.address?.[0];

          return (
            <div
              key={id}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <div className="p-4 bg-blue-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        patient.active ? "bg-green-500" : "bg-red-500"
                      }`}
                    ></div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{name}</h3>
                      <p className="text-sm text-gray-600">
                        ID: {patient.id} |
                        {patient.gender &&
                          ` ${
                            patient.gender.charAt(0).toUpperCase() +
                            patient.gender.slice(1)
                          }`}{" "}
                        |{patient.birthDate && ` Born: ${patient.birthDate}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(patient.id)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleExpanded(id)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    {onEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(entry)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Quick Info */}
                <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
                  {primaryEmail && (
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-1" />
                      {primaryEmail}
                    </div>
                  )}
                  {primaryPhone && (
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-1" />
                      {primaryPhone}
                    </div>
                  )}
                  {primaryAddress && (
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {primaryAddress.city}, {primaryAddress.state}{" "}
                      {primaryAddress.postalCode}
                    </div>
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="p-4 bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Identifiers */}
                    {patient.identifier && patient.identifier.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          Identifiers
                        </h4>
                        <div className="space-y-1">
                          {patient.identifier.map((id: any, idx: number) => (
                            <div
                              key={idx}
                              className="text-sm bg-gray-50 p-2 rounded"
                            >
                              <span className="font-medium">
                                {id.system || "Unknown"}:
                              </span>{" "}
                              {id.value}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Contact Information */}
                    {patient.telecom && patient.telecom.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          Contact Information
                        </h4>
                        <div className="space-y-1">
                          {patient.telecom.map((contact: any, idx: number) => (
                            <div
                              key={idx}
                              className="text-sm bg-gray-50 p-2 rounded"
                            >
                              <span className="font-medium">
                                {contact.system}:
                              </span>{" "}
                              {contact.value}
                              {contact.use && (
                                <span className="text-gray-500">
                                  {" "}
                                  ({contact.use})
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Address */}
                    {patient.address && patient.address.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          Address
                        </h4>
                        <div className="space-y-1">
                          {patient.address.map((addr: any, idx: number) => (
                            <div
                              key={idx}
                              className="text-sm bg-gray-50 p-2 rounded"
                            >
                              {addr.line &&
                                addr.line.map(
                                  (line: string, lineIdx: number) => (
                                    <div key={lineIdx}>{line}</div>
                                  )
                                )}
                              <div>
                                {addr.city}, {addr.state} {addr.postalCode}
                              </div>
                              {addr.use && (
                                <span className="text-gray-500">
                                  ({addr.use})
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Additional Info */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Additional Information
                      </h4>
                      <div className="space-y-1 text-sm">
                        {patient.maritalStatus && (
                          <div className="bg-gray-50 p-2 rounded">
                            <span className="font-medium">Marital Status:</span>{" "}
                            {patient.maritalStatus.text ||
                              patient.maritalStatus.coding?.[0]?.display}
                          </div>
                        )}
                        {patient.generalPractitioner &&
                          patient.generalPractitioner.length > 0 && (
                            <div className="bg-gray-50 p-2 rounded">
                              <span className="font-medium">Primary Care:</span>{" "}
                              {patient.generalPractitioner[0].display}
                            </div>
                          )}
                        {patient.deceasedBoolean !== undefined && (
                          <div className="bg-gray-50 p-2 rounded">
                            <span className="font-medium">Status:</span>{" "}
                            {patient.deceasedBoolean ? "Deceased" : "Living"}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Metadata */}
                  {patient.meta && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        Last Updated:{" "}
                        {new Date(patient.meta.lastUpdated).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export function AppointmentResultDisplay({
  data,
  loading,
  onViewDetails,
  onEdit,
}: ResultDisplayProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "booked":
      case "fulfilled":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "cancelled":
      case "noshow":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "pending":
      case "arrived":
      case "checked-in":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Calendar className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <Card title="Appointment Search Results" className="animate-pulse">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </Card>
    );
  }

  if (!data.length) {
    return (
      <Card title="Appointment Search Results">
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            No appointments found. Try adjusting your search criteria.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card title={`Appointment Search Results (${data.length})`}>
      <div className="space-y-4">
        {data.map((entry, index) => {
          const appointment = entry.resource || entry;
          const id = appointment.id || `appointment-${index}`;
          const isExpanded = expandedItems.has(id);

          const startTime = appointment.start
            ? new Date(appointment.start)
            : null;
          const endTime = appointment.end ? new Date(appointment.end) : null;

          return (
            <div
              key={id}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <div className="p-4 bg-green-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(appointment.status)}
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {appointment.appointmentType?.text || "Appointment"} -{" "}
                        {appointment.status?.toUpperCase()}
                      </h3>
                      <p className="text-sm text-gray-600">
                        ID: {appointment.id}
                        {startTime &&
                          ` | ${startTime.toLocaleDateString()} ${startTime.toLocaleTimeString()}`}
                        {appointment.minutesDuration &&
                          ` | ${appointment.minutesDuration} min`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleExpanded(id)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    {onEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(entry)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Quick Info */}
                <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
                  {appointment.reasonCode?.[0] && (
                    <div>
                      <span className="font-medium">Reason:</span>{" "}
                      {appointment.reasonCode[0].text}
                    </div>
                  )}
                  {appointment.description && (
                    <div>
                      <span className="font-medium">Description:</span>{" "}
                      {appointment.description}
                    </div>
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="p-4 bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Time Information */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Time Information
                      </h4>
                      <div className="space-y-1 text-sm">
                        {startTime && (
                          <div className="bg-gray-50 p-2 rounded">
                            <span className="font-medium">Start:</span>{" "}
                            {startTime.toLocaleString()}
                          </div>
                        )}
                        {endTime && (
                          <div className="bg-gray-50 p-2 rounded">
                            <span className="font-medium">End:</span>{" "}
                            {endTime.toLocaleString()}
                          </div>
                        )}
                        {appointment.minutesDuration && (
                          <div className="bg-gray-50 p-2 rounded">
                            <span className="font-medium">Duration:</span>{" "}
                            {appointment.minutesDuration} minutes
                          </div>
                        )}
                        {appointment.created && (
                          <div className="bg-gray-50 p-2 rounded">
                            <span className="font-medium">Created:</span>{" "}
                            {new Date(appointment.created).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Participants */}
                    {appointment.participant &&
                      appointment.participant.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">
                            Participants
                          </h4>
                          <div className="space-y-1">
                            {appointment.participant.map(
                              (participant: any, idx: number) => (
                                <div
                                  key={idx}
                                  className="text-sm bg-gray-50 p-2 rounded"
                                >
                                  {participant.actor?.display ||
                                    participant.actor?.reference ||
                                    "Unknown Participant"}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {/* Supporting Information */}
                    {appointment.supportingInformation &&
                      appointment.supportingInformation.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">
                            Supporting Information
                          </h4>
                          <div className="space-y-1">
                            {appointment.supportingInformation.map(
                              (info: any, idx: number) => (
                                <div
                                  key={idx}
                                  className="text-sm bg-gray-50 p-2 rounded"
                                >
                                  {info.display ||
                                    `${info.identifier?.system}: ${info.identifier?.value}`}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {/* Additional Details */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Additional Details
                      </h4>
                      <div className="space-y-1 text-sm">
                        {appointment.comment && (
                          <div className="bg-gray-50 p-2 rounded">
                            <span className="font-medium">Comment:</span>{" "}
                            {appointment.comment}
                          </div>
                        )}
                        {appointment.appointmentType && (
                          <div className="bg-gray-50 p-2 rounded">
                            <span className="font-medium">Type:</span>{" "}
                            {appointment.appointmentType.text}
                            {appointment.appointmentType.coding?.[0] && (
                              <div className="text-xs text-gray-500">
                                Code:{" "}
                                {appointment.appointmentType.coding[0].code}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Metadata */}
                  {appointment.meta && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        Last Updated:{" "}
                        {new Date(
                          appointment.meta.lastUpdated
                        ).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export function PractitionerResultDisplay({
  data,
  loading,
  onViewDetails,
  onEdit,
}: ResultDisplayProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  if (loading) {
    return (
      <Card title="Practitioner Search Results" className="animate-pulse">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </Card>
    );
  }

  if (!data.length) {
    return (
      <Card title="Practitioner Search Results">
        <div className="text-center py-8">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            No practitioners found. Try adjusting your search criteria.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card title={`Practitioner Search Results (${data.length})`}>
      <div className="space-y-4">
        {data.map((entry, index) => {
          const practitioner = entry.resource || entry;
          const id = practitioner.id || `practitioner-${index}`;
          const isExpanded = expandedItems.has(id);

          const name = practitioner.name?.[0]
            ? `${practitioner.name[0].given?.join(" ") || ""} ${
                practitioner.name[0].family || ""
              }`.trim()
            : "Unknown Practitioner";

          const primaryEmail = practitioner.telecom?.find(
            (t: any) => t.system === "email"
          )?.value;
          const primaryPhone = practitioner.telecom?.find(
            (t: any) => t.system === "phone"
          )?.value;
          const npiNumber = practitioner.identifier?.find((id: any) =>
            id.system?.includes("NPI")
          )?.value;

          return (
            <div
              key={id}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <div className="p-4 bg-purple-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        practitioner.active ? "bg-green-500" : "bg-red-500"
                      }`}
                    ></div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{name}</h3>
                      <p className="text-sm text-gray-600">
                        ID: {practitioner.id}
                        {npiNumber && ` | NPI: ${npiNumber}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleExpanded(id)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    {onEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(entry)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Quick Info */}
                <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
                  {primaryEmail && (
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-1" />
                      {primaryEmail}
                    </div>
                  )}
                  {primaryPhone && (
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-1" />
                      {primaryPhone}
                    </div>
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="p-4 bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Identifiers */}
                    {practitioner.identifier &&
                      practitioner.identifier.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">
                            Identifiers
                          </h4>
                          <div className="space-y-1">
                            {practitioner.identifier.map(
                              (id: any, idx: number) => (
                                <div
                                  key={idx}
                                  className="text-sm bg-gray-50 p-2 rounded"
                                >
                                  <span className="font-medium">
                                    {id.system || "Unknown"}:
                                  </span>{" "}
                                  {id.value}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {/* Contact Information */}
                    {practitioner.telecom &&
                      practitioner.telecom.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">
                            Contact Information
                          </h4>
                          <div className="space-y-1">
                            {practitioner.telecom.map(
                              (contact: any, idx: number) => (
                                <div
                                  key={idx}
                                  className="text-sm bg-gray-50 p-2 rounded"
                                >
                                  <span className="font-medium">
                                    {contact.system}:
                                  </span>{" "}
                                  {contact.value}
                                  {contact.use && (
                                    <span className="text-gray-500">
                                      {" "}
                                      ({contact.use})
                                    </span>
                                  )}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {/* Qualifications */}
                    {practitioner.qualification &&
                      practitioner.qualification.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">
                            Qualifications
                          </h4>
                          <div className="space-y-1">
                            {practitioner.qualification.map(
                              (qual: any, idx: number) => (
                                <div
                                  key={idx}
                                  className="text-sm bg-gray-50 p-2 rounded"
                                >
                                  <div className="font-medium">
                                    {qual.code?.text ||
                                      qual.code?.coding?.[0]?.display ||
                                      "Unknown Qualification"}
                                  </div>
                                  {qual.issuer && (
                                    <div className="text-xs text-gray-500">
                                      Issued by:{" "}
                                      {qual.issuer.display ||
                                        qual.issuer.reference}
                                    </div>
                                  )}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                  </div>

                  {/* Metadata */}
                  {practitioner.meta && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        Last Updated:{" "}
                        {new Date(
                          practitioner.meta.lastUpdated
                        ).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export function OrganizationResultDisplay({
  data,
  loading,
  onViewDetails,
  onEdit,
}: ResultDisplayProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  if (loading) {
    return (
      <Card title="Organization Search Results" className="animate-pulse">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </Card>
    );
  }

  if (!data.length) {
    return (
      <Card title="Organization Search Results">
        <div className="text-center py-8">
          <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            No organizations found. Try adjusting your search criteria.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card title={`Organization Search Results (${data.length})`}>
      <div className="space-y-4">
        {data.map((entry, index) => {
          const organization = entry.resource || entry;
          const id = organization.id || `organization-${index}`;
          const isExpanded = expandedItems.has(id);

          const orgType =
            organization.type?.[0]?.text ||
            organization.type?.[0]?.coding?.[0]?.display ||
            "Unknown Type";
          const payerId = organization.identifier?.find(
            (id: any) => id.system === "payerId"
          )?.value;

          return (
            <div
              key={id}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <div className="p-4 bg-orange-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        organization.active ? "bg-green-500" : "bg-red-500"
                      }`}
                    ></div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {organization.name || "Unknown Organization"}
                      </h3>
                      <p className="text-sm text-gray-600">
                        ID: {organization.id} | Type: {orgType}
                        {payerId && ` | Payer ID: ${payerId}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleExpanded(id)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    {onEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(entry)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="p-4 bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Identifiers */}
                    {organization.identifier &&
                      organization.identifier.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">
                            Identifiers
                          </h4>
                          <div className="space-y-1">
                            {organization.identifier.map(
                              (id: any, idx: number) => (
                                <div
                                  key={idx}
                                  className="text-sm bg-gray-50 p-2 rounded"
                                >
                                  <span className="font-medium">
                                    {id.system || "Unknown"}:
                                  </span>{" "}
                                  {id.value}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {/* Type Information */}
                    {organization.type && organization.type.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          Type Information
                        </h4>
                        <div className="space-y-1">
                          {organization.type.map((type: any, idx: number) => (
                            <div
                              key={idx}
                              className="text-sm bg-gray-50 p-2 rounded"
                            >
                              <div className="font-medium">{type.text}</div>
                              {type.coding?.[0] && (
                                <div className="text-xs text-gray-500">
                                  Code: {type.coding[0].code} | Display:{" "}
                                  {type.coding[0].display}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Contact Information */}
                    {organization.telecom &&
                      organization.telecom.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">
                            Contact Information
                          </h4>
                          <div className="space-y-1">
                            {organization.telecom.map(
                              (contact: any, idx: number) => (
                                <div
                                  key={idx}
                                  className="text-sm bg-gray-50 p-2 rounded"
                                >
                                  <span className="font-medium">
                                    {contact.system}:
                                  </span>{" "}
                                  {contact.value}
                                  {contact.use && (
                                    <span className="text-gray-500">
                                      {" "}
                                      ({contact.use})
                                    </span>
                                  )}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {/* Address */}
                    {organization.address &&
                      organization.address.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">
                            Address
                          </h4>
                          <div className="space-y-1">
                            {organization.address.map(
                              (addr: any, idx: number) => (
                                <div
                                  key={idx}
                                  className="text-sm bg-gray-50 p-2 rounded"
                                >
                                  {addr.line &&
                                    addr.line.map(
                                      (line: string, lineIdx: number) => (
                                        <div key={lineIdx}>{line}</div>
                                      )
                                    )}
                                  <div>
                                    {addr.city}, {addr.state} {addr.postalCode}
                                  </div>
                                  {addr.use && (
                                    <span className="text-gray-500">
                                      ({addr.use})
                                    </span>
                                  )}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                  </div>

                  {/* Metadata */}
                  {organization.meta && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        Last Updated:{" "}
                        {new Date(
                          organization.meta.lastUpdated
                        ).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
