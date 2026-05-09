import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';
import { SubscriptionGuard } from '../components/SubscriptionGuard';
import { CreditGate } from '../components/CreditGate';
import { CreditConfirmModal } from '../components/CreditConfirmModal';
import { useCredits } from '../hooks/useCredits';
import { HiInformationCircle } from 'react-icons/hi';
import { HiArrowLeft, HiArrowRight, HiCheckCircle, HiExclamationTriangle, HiLanguage } from 'react-icons/hi2';
import { FiDownload, FiTrash2 } from 'react-icons/fi';

type ViewMode = 'pt' | 'en' | 'both';
type FieldType = 'text' | 'textarea' | 'date' | 'select' | 'radio';

interface FieldOption {
  value: string;
  labelPt: string;
  labelEn: string;
}

interface StepField {
  id: string;
  type: FieldType;
  required: boolean;
  labelPt: string;
  labelEn: string;
  placeholderPt?: string;
  placeholderEn?: string;
  helpPt?: string;
  helpEn?: string;
  options?: FieldOption[];
  showWhen?: {
    fieldId: string;
    equals: string;
  };
}

interface DS160Step {
  id: string;
  titlePt: string;
  titleEn: string;
  descriptionPt: string;
  descriptionEn: string;
  reminders: Array<{ pt: string; en: string }>;
  fields: StepField[];
}

type FormData = Record<string, string>;

const STORAGE_KEY = 'ds160-guided-v2';

const yesNoOptions: FieldOption[] = [
  { value: 'yes', labelPt: 'Sim', labelEn: 'Yes' },
  { value: 'no', labelPt: 'Não', labelEn: 'No' },
];

const stripAccents = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const STEPS: DS160Step[] = [
  {
    id: 'personal-1',
    titlePt: 'Passo 1 — Personal Information 1',
    titleEn: 'Step 1 — Personal Information 1',
    descriptionPt: 'Preencha seus dados pessoais exatamente como no passaporte, sem acentos.',
    descriptionEn: 'Fill your personal data exactly as in your passport, without accents.',
    reminders: [
      { pt: 'Surnames: todos os sobrenomes do passaporte.', en: 'Surnames: all surnames exactly as in passport.' },
      { pt: 'Given Names: nome e nome composto normalmente.', en: 'Given Names: first name and compound names normally.' },
      { pt: 'Ao final desta etapa, clique em Save.', en: 'At the end of this step, click Save.' },
    ],
    fields: [
      { id: 'surname', type: 'text', required: true, labelPt: 'Surnames (sobrenome)', labelEn: 'Surnames' },
      { id: 'givenNames', type: 'text', required: true, labelPt: 'Given Names (primeiro nome)', labelEn: 'Given Names' },
      { id: 'fullNameNative', type: 'text', required: false, labelPt: 'Full Name in Native Alphabet', labelEn: 'Full Name in Native Alphabet' },
      { id: 'otherNamesUsed', type: 'radio', required: true, labelPt: 'Já usou outros nomes?', labelEn: 'Have you ever used other names?', options: yesNoOptions },
      {
        id: 'otherNamesDetails',
        type: 'textarea',
        required: true,
        labelPt: 'Detalhes dos nomes anteriores',
        labelEn: 'Previous names details',
        showWhen: { fieldId: 'otherNamesUsed', equals: 'yes' },
      },
      {
        id: 'telecode',
        type: 'radio',
        required: true,
        labelPt: 'Do you have a telecode that represents your name?',
        labelEn: 'Do you have a telecode that represents your name?',
        options: yesNoOptions,
        helpPt: 'Para brasileiros, normalmente é No.',
        helpEn: 'For Brazilians, this is usually No.',
      },
      {
        id: 'sex',
        type: 'select',
        required: true,
        labelPt: 'Sex',
        labelEn: 'Sex',
        options: [
          { value: 'male', labelPt: 'Male (Homem)', labelEn: 'Male' },
          { value: 'female', labelPt: 'Female (Mulher)', labelEn: 'Female' },
        ],
      },
      {
        id: 'maritalStatus',
        type: 'select',
        required: true,
        labelPt: 'Marital Status',
        labelEn: 'Marital Status',
        options: [
          { value: 'single', labelPt: 'Single (Solteiro)', labelEn: 'Single' },
          { value: 'married', labelPt: 'Married (Casado)', labelEn: 'Married' },
          { value: 'divorced', labelPt: 'Divorced (Divorciado)', labelEn: 'Divorced' },
          { value: 'widowed', labelPt: 'Widowed (Viúvo)', labelEn: 'Widowed' },
        ],
      },
      { id: 'birthDate', type: 'date', required: true, labelPt: 'Date of Birth', labelEn: 'Date of Birth' },
      { id: 'birthState', type: 'text', required: true, labelPt: 'State/Province of Birth', labelEn: 'State/Province of Birth' },
      { id: 'birthCountry', type: 'text', required: true, labelPt: 'Country/Region of Birth', labelEn: 'Country/Region of Birth', placeholderPt: 'Brazil', placeholderEn: 'Brazil' },
    ],
  },
  {
    id: 'personal-2',
    titlePt: 'Passo 2 — Personal Information 2',
    titleEn: 'Step 2 — Personal Information 2',
    descriptionPt: 'Nacionalidade e documentos de identificação.',
    descriptionEn: 'Nationality and identification details.',
    reminders: [
      { pt: 'Country/Region of Origin: Brazil.', en: 'Country/Region of Origin: Brazil.' },
      { pt: 'National Identification Number: CPF.', en: 'National Identification Number: CPF.' },
      { pt: 'SSN e Taxpayer ID: Does Not Apply.', en: 'SSN and Taxpayer ID: Does Not Apply.' },
    ],
    fields: [
      { id: 'originCountry', type: 'text', required: true, labelPt: 'Country/Region of Origin', labelEn: 'Country/Region of Origin', placeholderPt: 'Brazil', placeholderEn: 'Brazil' },
      { id: 'otherNationality', type: 'radio', required: true, labelPt: 'Possui outra nacionalidade?', labelEn: 'Do you hold any other nationality?', options: yesNoOptions },
      { id: 'otherNationalityDetails', type: 'text', required: true, labelPt: 'Qual outra nacionalidade?', labelEn: 'Other nationality', showWhen: { fieldId: 'otherNationality', equals: 'yes' } },
      { id: 'residentOtherCountry', type: 'radio', required: true, labelPt: 'É residente permanente de outro país?', labelEn: 'Are you a permanent resident of another country?', options: yesNoOptions },
      { id: 'residentOtherCountryDetails', type: 'text', required: true, labelPt: 'País de residência permanente', labelEn: 'Permanent resident country', showWhen: { fieldId: 'residentOtherCountry', equals: 'yes' } },
      { id: 'nationalIdNumber', type: 'text', required: true, labelPt: 'National Identification Number (CPF)', labelEn: 'National Identification Number (CPF)' },
      { id: 'usSSN', type: 'text', required: true, labelPt: 'U.S. Social Security Number', labelEn: 'U.S. Social Security Number', placeholderPt: 'Does Not Apply', placeholderEn: 'Does Not Apply' },
      { id: 'usTaxpayerId', type: 'text', required: true, labelPt: 'U.S. Taxpayer ID Number', labelEn: 'U.S. Taxpayer ID Number', placeholderPt: 'Does Not Apply', placeholderEn: 'Does Not Apply' },
    ],
  },
  {
    id: 'travel-info',
    titlePt: 'Passo 3 — Travel Information',
    titleEn: 'Step 3 — Travel Information',
    descriptionPt: 'Motivo da viagem, tipo de visto e planejamento.',
    descriptionEn: 'Trip purpose, visa type, and planning.',
    reminders: [
      { pt: 'Purpose: Temp. Business Pleasure Visitor B.', en: 'Purpose: Temp. Business Pleasure Visitor B.' },
      { pt: 'Specify: Business & Tourism (Temporary Visitor) (B1/B2).', en: 'Specify: Business & Tourism (Temporary Visitor) (B1/B2).' },
      { pt: 'Responda com honestidade para evitar inconsistências.', en: 'Answer honestly to avoid inconsistencies.' },
    ],
    fields: [
      { id: 'tripPurpose', type: 'text', required: true, labelPt: 'Purpose of Trip to the U.S.', labelEn: 'Purpose of Trip to the U.S.', placeholderPt: 'Temp. Business Pleasure Visitor B', placeholderEn: 'Temp. Business Pleasure Visitor B' },
      { id: 'tripSpecify', type: 'text', required: true, labelPt: 'Specify', labelEn: 'Specify', placeholderPt: 'Business & Tourism (Temporary Visitor) (B1/B2)', placeholderEn: 'Business & Tourism (Temporary Visitor) (B1/B2)' },
      { id: 'specificPlans', type: 'radio', required: true, labelPt: 'Have you made specific travel plans?', labelEn: 'Have you made specific travel plans?', options: yesNoOptions },
      { id: 'arrivalDate', type: 'date', required: true, labelPt: 'Date of Arrival in U.S.', labelEn: 'Date of Arrival in U.S.', showWhen: { fieldId: 'specificPlans', equals: 'yes' } },
      { id: 'arrivalCity', type: 'text', required: true, labelPt: 'Arrival City', labelEn: 'Arrival City', showWhen: { fieldId: 'specificPlans', equals: 'yes' } },
      { id: 'departureDate', type: 'date', required: true, labelPt: 'Date of Departure from U.S.', labelEn: 'Date of Departure from U.S.', showWhen: { fieldId: 'specificPlans', equals: 'yes' } },
      { id: 'stayAddressExact', type: 'textarea', required: true, labelPt: 'Address Where You Will Stay in the U.S.', labelEn: 'Address Where You Will Stay in the U.S.', showWhen: { fieldId: 'specificPlans', equals: 'yes' } },
      { id: 'intendedArrivalDate', type: 'date', required: true, labelPt: 'Intended Date of Arrival', labelEn: 'Intended Date of Arrival', showWhen: { fieldId: 'specificPlans', equals: 'no' } },
      { id: 'intendedLengthStay', type: 'text', required: true, labelPt: 'Intended Length of Stay in U.S.', labelEn: 'Intended Length of Stay in U.S.', showWhen: { fieldId: 'specificPlans', equals: 'no' } },
      { id: 'stayAddressEstimate', type: 'textarea', required: true, labelPt: 'Estimated Address in U.S.', labelEn: 'Estimated Address in U.S.', showWhen: { fieldId: 'specificPlans', equals: 'no' } },
      {
        id: 'tripPayer',
        type: 'select',
        required: true,
        labelPt: 'Person/Entity Paying for Your Trip',
        labelEn: 'Person/Entity Paying for Your Trip',
        options: [
          { value: 'self', labelPt: 'Self', labelEn: 'Self' },
          { value: 'other_person', labelPt: 'Other Person', labelEn: 'Other Person' },
          { value: 'company', labelPt: 'Company/Organization', labelEn: 'Company/Organization' },
        ],
      },
      { id: 'tripPayerDetails', type: 'text', required: true, labelPt: 'Detalhes (grau de parentesco/empresa)', labelEn: 'Details (relationship/company)', showWhen: { fieldId: 'tripPayer', equals: 'other_person' } },
    ],
  },
  {
    id: 'companions',
    titlePt: 'Passo 4 — Travel Companions Information',
    titleEn: 'Step 4 — Travel Companions Information',
    descriptionPt: 'Informe se viaja sozinho ou acompanhado.',
    descriptionEn: 'Inform whether you are traveling alone or with companions.',
    reminders: [
      { pt: 'Se viajar com alguém, informe nome e relacionamento.', en: 'If traveling with others, include name and relationship.' },
      { pt: 'Use nomes sem acento.', en: 'Use names without accents.' },
      { pt: 'Ao final: Save e Next.', en: 'At the end: Save and Next.' },
    ],
    fields: [
      { id: 'travelWithOthers', type: 'radio', required: true, labelPt: 'Are there other persons traveling with you?', labelEn: 'Are there other persons traveling with you?', options: yesNoOptions },
      { id: 'companionsDetails', type: 'textarea', required: true, labelPt: 'Companions details (Surname, Given Name, Relationship)', labelEn: 'Companions details (Surname, Given Name, Relationship)', showWhen: { fieldId: 'travelWithOthers', equals: 'yes' } },
    ],
  },
  {
    id: 'previous-us-travel',
    titlePt: 'Passo 5 — Previous U.S. Travel Information',
    titleEn: 'Step 5 — Previous U.S. Travel Information',
    descriptionPt: 'Histórico de viagens, vistos e recusas anteriores.',
    descriptionEn: 'History of previous travel, visas, and refusals.',
    reminders: [
      { pt: 'Se for primeira tentativa, esta etapa é mais simples.', en: 'If first application, this step is simpler.' },
      { pt: 'Se houver recusa anterior, explique brevemente.', en: 'If refused before, provide a brief explanation.' },
      { pt: 'Ao final: Save e Next.', en: 'At the end: Save and Next.' },
    ],
    fields: [
      { id: 'beenInUS', type: 'radio', required: true, labelPt: 'Have you ever been in the U.S.?', labelEn: 'Have you ever been in the U.S.?', options: yesNoOptions },
      { id: 'beenInUSDetails', type: 'textarea', required: true, labelPt: 'Detalhes das últimas visitas (até 5)', labelEn: 'Details of last visits (up to 5)', showWhen: { fieldId: 'beenInUS', equals: 'yes' } },
      { id: 'hadUSVisa', type: 'radio', required: true, labelPt: 'Have you ever been issued a U.S. Visa?', labelEn: 'Have you ever been issued a U.S. Visa?', options: yesNoOptions },
      { id: 'hadUSVisaDetails', type: 'textarea', required: true, labelPt: 'Detalhes do último visto emitido', labelEn: 'Details about last issued visa', showWhen: { fieldId: 'hadUSVisa', equals: 'yes' } },
      { id: 'refusedVisa', type: 'radio', required: true, labelPt: 'Have you ever been refused a U.S. Visa or admission?', labelEn: 'Have you ever been refused a U.S. Visa or admission?', options: yesNoOptions },
      { id: 'refusedVisaDetails', type: 'textarea', required: true, labelPt: 'Explique a recusa/admissão', labelEn: 'Explain refusal/admission', showWhen: { fieldId: 'refusedVisa', equals: 'yes' } },
      { id: 'immigrantPetition', type: 'radio', required: true, labelPt: 'Has anyone filed an immigrant petition on your behalf?', labelEn: 'Has anyone filed an immigrant petition on your behalf?', options: yesNoOptions },
      { id: 'immigrantPetitionDetails', type: 'textarea', required: true, labelPt: 'Explique a petição', labelEn: 'Explain immigrant petition', showWhen: { fieldId: 'immigrantPetition', equals: 'yes' } },
    ],
  },
  {
    id: 'address-phone',
    titlePt: 'Passo 6 — Address and Phone Information',
    titleEn: 'Step 6 — Address and Phone Information',
    descriptionPt: 'Endereço, telefone, e-mail e redes sociais.',
    descriptionEn: 'Address, phone, email, and social media.',
    reminders: [
      { pt: 'Digite endereço sem acentos e CEP sem traço.', en: 'Type address without accents and ZIP with no dashes.' },
      { pt: 'Informe usernames de redes sociais (sem senha).', en: 'Provide social media usernames (no passwords).' },
      { pt: 'Ao final: Save e Next.', en: 'At the end: Save and Next.' },
    ],
    fields: [
      { id: 'homeStreet', type: 'text', required: true, labelPt: 'Home Address - Street Address', labelEn: 'Home Address - Street Address' },
      { id: 'homeCity', type: 'text', required: true, labelPt: 'Home Address - City', labelEn: 'Home Address - City' },
      { id: 'homeState', type: 'text', required: true, labelPt: 'Home Address - State/Province', labelEn: 'Home Address - State/Province' },
      { id: 'homeZip', type: 'text', required: true, labelPt: 'Home Address - Postal Zone/ZIP Code', labelEn: 'Home Address - Postal Zone/ZIP Code' },
      { id: 'homeCountry', type: 'text', required: true, labelPt: 'Home Address - Country/Region', labelEn: 'Home Address - Country/Region', placeholderPt: 'Brazil', placeholderEn: 'Brazil' },
      { id: 'mailingSame', type: 'radio', required: true, labelPt: 'Is your Mailing Address the same as Home Address?', labelEn: 'Is your Mailing Address the same as Home Address?', options: yesNoOptions },
      { id: 'mailingAddress', type: 'textarea', required: true, labelPt: 'Mailing Address', labelEn: 'Mailing Address', showWhen: { fieldId: 'mailingSame', equals: 'no' } },
      { id: 'primaryPhone', type: 'text', required: true, labelPt: 'Primary Phone Number', labelEn: 'Primary Phone Number' },
      { id: 'secondaryPhone', type: 'text', required: true, labelPt: 'Secondary Phone Number', labelEn: 'Secondary Phone Number', placeholderPt: 'Does Not Apply', placeholderEn: 'Does Not Apply' },
      { id: 'workPhone', type: 'text', required: true, labelPt: 'Work Phone Number', labelEn: 'Work Phone Number', placeholderPt: 'Does Not Apply', placeholderEn: 'Does Not Apply' },
      { id: 'otherPhonesUsed', type: 'radio', required: true, labelPt: 'Have you used other phone numbers in the last five years?', labelEn: 'Have you used other phone numbers in the last five years?', options: yesNoOptions },
      { id: 'otherPhonesDetails', type: 'textarea', required: true, labelPt: 'Outros números usados', labelEn: 'Other phone numbers used', showWhen: { fieldId: 'otherPhonesUsed', equals: 'yes' } },
      { id: 'emailAddress', type: 'text', required: true, labelPt: 'Email Address', labelEn: 'Email Address' },
      { id: 'otherEmailsUsed', type: 'radio', required: true, labelPt: 'Have you used other email addresses in the last five years?', labelEn: 'Have you used other email addresses in the last five years?', options: yesNoOptions },
      { id: 'otherEmailsDetails', type: 'textarea', required: true, labelPt: 'Outros e-mails usados', labelEn: 'Other email addresses used', showWhen: { fieldId: 'otherEmailsUsed', equals: 'yes' } },
      { id: 'socialMediaPresence', type: 'radio', required: true, labelPt: 'Do you have a social media presence?', labelEn: 'Do you have a social media presence?', options: yesNoOptions },
      { id: 'socialMediaDetails', type: 'textarea', required: true, labelPt: 'Plataformas e usernames', labelEn: 'Platforms and usernames', showWhen: { fieldId: 'socialMediaPresence', equals: 'yes' } },
      { id: 'otherWebPresence', type: 'radio', required: true, labelPt: 'Do you wish to provide information about other websites/apps used in last five years?', labelEn: 'Do you wish to provide information about other websites/apps used in last five years?', options: yesNoOptions },
      { id: 'otherWebPresenceDetails', type: 'textarea', required: true, labelPt: 'Outros sites/aplicativos', labelEn: 'Other websites/applications', showWhen: { fieldId: 'otherWebPresence', equals: 'yes' } },
    ],
  },
  {
    id: 'passport',
    titlePt: 'Passo 7 — Passport Information',
    titleEn: 'Step 7 — Passport Information',
    descriptionPt: 'Dados do passaporte e emissão.',
    descriptionEn: 'Passport and issuance data.',
    reminders: [
      { pt: 'Brasileiros: Passport Book Number = Does Not Apply.', en: 'Brazilians: Passport Book Number = Does Not Apply.' },
      { pt: 'Verifique validade mínima de 6 meses.', en: 'Check minimum 6-month passport validity.' },
      { pt: 'Ao final: Save e Next.', en: 'At the end: Save and Next.' },
    ],
    fields: [
      { id: 'passportType', type: 'text', required: true, labelPt: 'Passport/Travel Document Type', labelEn: 'Passport/Travel Document Type', placeholderPt: 'Regular', placeholderEn: 'Regular' },
      { id: 'passportNumber', type: 'text', required: true, labelPt: 'Passport/Travel Document Number', labelEn: 'Passport/Travel Document Number' },
      { id: 'passportBookNumber', type: 'text', required: true, labelPt: 'Passport Book Number', labelEn: 'Passport Book Number', placeholderPt: 'Does Not Apply', placeholderEn: 'Does Not Apply' },
      { id: 'passportIssuedCountry', type: 'text', required: true, labelPt: 'Country/Authority that Issued Passport', labelEn: 'Country/Authority that Issued Passport', placeholderPt: 'Brazil', placeholderEn: 'Brazil' },
      { id: 'passportIssuedCity', type: 'text', required: true, labelPt: 'City where passport was issued', labelEn: 'City where passport was issued' },
      { id: 'passportIssuedState', type: 'text', required: true, labelPt: 'State/Province where passport was issued', labelEn: 'State/Province where passport was issued' },
      { id: 'passportIssueDate', type: 'date', required: true, labelPt: 'Issuance Date', labelEn: 'Issuance Date' },
      { id: 'passportExpirationDate', type: 'date', required: true, labelPt: 'Expiration Date', labelEn: 'Expiration Date' },
      { id: 'lostPassport', type: 'radio', required: true, labelPt: 'Have you ever lost a passport or had one stolen?', labelEn: 'Have you ever lost a passport or had one stolen?', options: yesNoOptions },
      { id: 'lostPassportDetails', type: 'textarea', required: true, labelPt: 'Detalhes do passaporte perdido/roubado', labelEn: 'Lost/stolen passport details', showWhen: { fieldId: 'lostPassport', equals: 'yes' } },
    ],
  },
  {
    id: 'us-contact',
    titlePt: 'Passo 8 — U.S. Point of Contact Information',
    titleEn: 'Step 8 — U.S. Point of Contact Information',
    descriptionPt: 'Contato de referência nos Estados Unidos.',
    descriptionEn: 'Reference point of contact in the United States.',
    reminders: [
      { pt: 'Pode ser pessoa, hotel, empresa ou organização.', en: 'It can be a person, hotel, company, or organization.' },
      { pt: 'Não deixe as duas opções sem contato.', en: 'Do not leave both contact options unknown.' },
      { pt: 'Clique Next ao final.', en: 'Click Next at the end.' },
    ],
    fields: [
      { id: 'usContactSurname', type: 'text', required: false, labelPt: 'Contact Surnames', labelEn: 'Contact Surnames', placeholderPt: 'Do Not Know', placeholderEn: 'Do Not Know' },
      { id: 'usContactGivenName', type: 'text', required: false, labelPt: 'Contact Given Name', labelEn: 'Contact Given Name', placeholderPt: 'Do Not Know', placeholderEn: 'Do Not Know' },
      { id: 'usContactOrganization', type: 'text', required: false, labelPt: 'Organization Name', labelEn: 'Organization Name', placeholderPt: 'Hotel/empresa/organização', placeholderEn: 'Hotel/company/organization' },
      {
        id: 'usContactRelationship',
        type: 'select',
        required: true,
        labelPt: 'Relationship to You',
        labelEn: 'Relationship to You',
        options: [
          { value: 'friend', labelPt: 'Friend', labelEn: 'Friend' },
          { value: 'relative', labelPt: 'Relative', labelEn: 'Relative' },
          { value: 'employer', labelPt: 'Employer', labelEn: 'Employer' },
          { value: 'other', labelPt: 'Other', labelEn: 'Other' },
        ],
      },
    ],
  },
  {
    id: 'family-relatives',
    titlePt: 'Passo 9 — Family Information: Relatives',
    titleEn: 'Step 9 — Family Information: Relatives',
    descriptionPt: 'Dados dos pais e parentes nos EUA.',
    descriptionEn: 'Parents and relatives in the U.S.',
    reminders: [
      { pt: 'Preencha nome dos pais sem acentos.', en: 'Fill parents names without accents.' },
      { pt: 'Immediate relatives: noivo(a), cônjuge, filho(a), irmão(ã).', en: 'Immediate relatives: fiance(e), spouse, child, sibling.' },
      { pt: 'Clique Next ao final.', en: 'Click Next at the end.' },
    ],
    fields: [
      { id: 'fatherSurname', type: 'text', required: true, labelPt: "Father's Surname", labelEn: "Father's Surname" },
      { id: 'fatherGivenName', type: 'text', required: true, labelPt: "Father's Given Name", labelEn: "Father's Given Name" },
      { id: 'fatherBirthDate', type: 'date', required: true, labelPt: "Father's Date of Birth", labelEn: "Father's Date of Birth" },
      { id: 'fatherInUS', type: 'radio', required: true, labelPt: 'Is your father in the U.S.?', labelEn: 'Is your father in the U.S.?', options: yesNoOptions },
      { id: 'motherSurname', type: 'text', required: true, labelPt: "Mother's Surname", labelEn: "Mother's Surname" },
      { id: 'motherGivenName', type: 'text', required: true, labelPt: "Mother's Given Name", labelEn: "Mother's Given Name" },
      { id: 'motherBirthDate', type: 'date', required: true, labelPt: "Mother's Date of Birth", labelEn: "Mother's Date of Birth" },
      { id: 'motherInUS', type: 'radio', required: true, labelPt: 'Is your mother in the U.S.?', labelEn: 'Is your mother in the U.S.?', options: yesNoOptions },
      { id: 'immediateRelativesUS', type: 'radio', required: true, labelPt: 'Do you have immediate relatives in the U.S.?', labelEn: 'Do you have immediate relatives in the U.S.?', options: yesNoOptions },
      { id: 'immediateRelativesUSDetails', type: 'textarea', required: true, labelPt: 'Detalhes dos parentes imediatos', labelEn: 'Immediate relatives details', showWhen: { fieldId: 'immediateRelativesUS', equals: 'yes' } },
      { id: 'otherRelativesUS', type: 'radio', required: true, labelPt: 'Do you have any other relatives in the U.S.?', labelEn: 'Do you have any other relatives in the U.S.?', options: yesNoOptions },
    ],
  },
  {
    id: 'present-work-education',
    titlePt: 'Passo 10 — Present Work/Education/Training Information',
    titleEn: 'Step 10 — Present Work/Education/Training Information',
    descriptionPt: 'Atividade profissional atual e dados da empresa/escola.',
    descriptionEn: 'Current professional activity and employer/school details.',
    reminders: [
      { pt: 'Informe salário real e funções reais.', en: 'Provide real salary and real duties.' },
      { pt: 'Dados inconsistentes podem prejudicar na entrevista.', en: 'Inconsistent data can hurt your interview.' },
      { pt: 'Ao final: Save e Next.', en: 'At the end: Save and Next.' },
    ],
    fields: [
      { id: 'primaryOccupation', type: 'text', required: true, labelPt: 'Primary Occupation', labelEn: 'Primary Occupation' },
      { id: 'employerSchoolName', type: 'text', required: true, labelPt: 'Present Employer or School Name', labelEn: 'Present Employer or School Name' },
      { id: 'employerStreet', type: 'text', required: true, labelPt: 'Employer/School Street Address', labelEn: 'Employer/School Street Address' },
      { id: 'employerCity', type: 'text', required: true, labelPt: 'Employer/School City', labelEn: 'Employer/School City' },
      { id: 'employerState', type: 'text', required: true, labelPt: 'Employer/School State/Province', labelEn: 'Employer/School State/Province' },
      { id: 'employerZip', type: 'text', required: true, labelPt: 'Employer/School Postal Zone/ZIP Code', labelEn: 'Employer/School Postal Zone/ZIP Code' },
      { id: 'employerPhone', type: 'text', required: true, labelPt: 'Employer/School Phone Number', labelEn: 'Employer/School Phone Number' },
      { id: 'employerCountry', type: 'text', required: true, labelPt: 'Employer/School Country/Region', labelEn: 'Employer/School Country/Region' },
      { id: 'jobStartDate', type: 'date', required: true, labelPt: 'Start Date', labelEn: 'Start Date' },
      { id: 'monthlyIncome', type: 'text', required: true, labelPt: 'Monthly Income in Local Currency', labelEn: 'Monthly Income in Local Currency' },
      { id: 'jobDuties', type: 'textarea', required: true, labelPt: 'Briefly describe your duties', labelEn: 'Briefly describe your duties' },
    ],
  },
  {
    id: 'previous-work-education',
    titlePt: 'Passo 11 — Previous Work/Education/Training Information',
    titleEn: 'Step 11 — Previous Work/Education/Training Information',
    descriptionPt: 'Experiências anteriores de trabalho e estudo (últimos 5 anos, quando aplicável).',
    descriptionEn: 'Previous employment and education history (last 5 years, when applicable).',
    reminders: [
      { pt: 'Se não houve outro emprego/escola além do atual, marque No.', en: 'If you had no other employer/school besides the current one, mark No.' },
      { pt: 'Se forem mais de um, use Add Another no DS-160 e repita as informações.', en: 'If there are multiple entries, use Add Another in DS-160 and repeat the information.' },
      { pt: 'Ao final: Save e Next.', en: 'At the end: Save and Next.' },
    ],
    fields: [
      { id: 'previouslyEmployed', type: 'radio', required: true, labelPt: 'Were you previously employed?', labelEn: 'Were you previously employed?', options: yesNoOptions },
      {
        id: 'previousEmploymentDetails',
        type: 'textarea',
        required: true,
        labelPt: 'Detalhes do emprego anterior',
        labelEn: 'Previous employment details',
        showWhen: { fieldId: 'previouslyEmployed', equals: 'yes' },
        helpPt:
          'Inclua: Employer Street Address, City, State/Province, Postal Zone/ZIP Code, Country/Region, Telephone, Job Title, Supervisor (Surname/Given Names ou Do Not Know), Employment Date From/To e duties.',
        helpEn:
          'Include: Employer address, city, state/province, postal/ZIP, country/region, phone, job title, supervisor (or Do Not Know), employment dates (from/to), and duties.',
      },
      {
        id: 'attendedEducationalInstitutions',
        type: 'radio',
        required: true,
        labelPt: 'Have you attended any educational institutions at a secondary level or above?',
        labelEn: 'Have you attended any educational institutions at a secondary level or above?',
        options: yesNoOptions,
      },
      {
        id: 'educationInstitutionDetails',
        type: 'textarea',
        required: true,
        labelPt: 'Detalhes de instituições de ensino',
        labelEn: 'Educational institutions details',
        showWhen: { fieldId: 'attendedEducationalInstitutions', equals: 'yes' },
        helpPt:
          'Inclua: Name of Institution, Street Address, City, State/Province, Postal Zone/ZIP, Country/Region, Course of Study, Date of Attendance From/To. Para mais de uma, use Add Another no DS-160.',
        helpEn:
          'Include: Institution name, address, city, state/province, postal/ZIP, country/region, course of study, attendance dates (from/to). For more than one, use Add Another in DS-160.',
      },
    ],
  },
  {
    id: 'additional-work-education',
    titlePt: 'Passo 12 — Additional Work/Education/Training Information',
    titleEn: 'Step 12 — Additional Work/Education/Training Information',
    descriptionPt: 'Perguntas gerais de trabalho/educação/treinamento. Se responder Sim, detalhe.',
    descriptionEn: 'General work/education/training questions. If Yes, provide details.',
    reminders: [
      { pt: 'Responda com sinceridade; inconsistências podem prejudicar.', en: 'Answer truthfully; inconsistencies may hurt your case.' },
      { pt: 'Idiomas: inclua Portugues e escreva sem acento.', en: 'Languages: include Portuguese and write without accents.' },
      { pt: 'Ao final: Next.', en: 'At the end: Next.' },
    ],
    fields: [
      { id: 'belongClanTribe', type: 'radio', required: true, labelPt: 'Do you belong to a clan or tribe?', labelEn: 'Do you belong to a clan or tribe?', options: yesNoOptions },
      { id: 'clanTribeDetails', type: 'text', required: true, labelPt: 'Qual clã ou tribo?', labelEn: 'Which clan or tribe?', showWhen: { fieldId: 'belongClanTribe', equals: 'yes' } },
      {
        id: 'languagesYouSpeak',
        type: 'textarea',
        required: true,
        labelPt: 'Provide a List of Languages You Speak',
        labelEn: 'Provide a List of Languages You Speak',
        helpPt: 'Liste todas, inclusive Portugues, sem acento. Separe por virgulas.',
        helpEn: 'List all languages, including Portuguese, without accents. Separate by commas.',
      },
      { id: 'traveledLastFiveYears', type: 'radio', required: true, labelPt: 'Have you traveled to any countries/regions within the last five years?', labelEn: 'Have you traveled to any countries/regions within the last five years?', options: yesNoOptions },
      {
        id: 'traveledCountriesDetails',
        type: 'textarea',
        required: true,
        labelPt: 'Países/regiões visitados (últimos 5 anos)',
        labelEn: 'Countries/regions visited (last 5 years)',
        showWhen: { fieldId: 'traveledLastFiveYears', equals: 'yes' },
        helpPt: 'Inclua os nomes dos paises. Para varios, liste um por linha.',
        helpEn: 'Include country names. For multiple, list one per line.',
      },
      { id: 'belongedToOrganization', type: 'radio', required: true, labelPt: 'Have you belonged to, contributed to, or worked for any professional, social, or charitable organization?', labelEn: 'Have you belonged to, contributed to, or worked for any professional, social, or charitable organization?', options: yesNoOptions },
      { id: 'organizationDetails', type: 'textarea', required: true, labelPt: 'Detalhes da organização', labelEn: 'Organization details', showWhen: { fieldId: 'belongedToOrganization', equals: 'yes' } },
      { id: 'specializedSkills', type: 'radio', required: true, labelPt: 'Do you have any specialized skills or training, such as firearms, explosives, nuclear, biological, or chemical experience?', labelEn: 'Do you have any specialized skills or training, such as firearms, explosives, nuclear, biological, or chemical experience?', options: yesNoOptions },
      { id: 'specializedSkillsDetails', type: 'textarea', required: true, labelPt: 'Detalhe habilidades/treinamentos', labelEn: 'Describe skills/training', showWhen: { fieldId: 'specializedSkills', equals: 'yes' } },
      { id: 'servedMilitary', type: 'radio', required: true, labelPt: 'Have you ever served in the military?', labelEn: 'Have you ever served in the military?', options: yesNoOptions },
      { id: 'militaryDetails', type: 'textarea', required: true, labelPt: 'Detalhes do serviço militar', labelEn: 'Military service details', showWhen: { fieldId: 'servedMilitary', equals: 'yes' } },
      {
        id: 'servedParamilitary',
        type: 'radio',
        required: true,
        labelPt: 'Have you ever served in, been a member of, or been involved with a paramilitary unit, vigilante unit, rebel group, guerrilla group, or insurgent organization?',
        labelEn: 'Have you ever served in, been a member of, or been involved with a paramilitary unit, vigilante unit, rebel group, guerrilla group, or insurgent organization?',
        options: yesNoOptions,
      },
      { id: 'paramilitaryDetails', type: 'textarea', required: true, labelPt: 'Detalhes do envolvimento', labelEn: 'Involvement details', showWhen: { fieldId: 'servedParamilitary', equals: 'yes' } },
    ],
  },
  {
    id: 'security-background-1',
    titlePt: 'Passo 13 — Security and Background: Part 1',
    titleEn: 'Step 13 — Security and Background: Part 1',
    descriptionPt: 'Perguntas sobre saúde física/mental e drogas. Geralmente é Não; se Sim, explique.',
    descriptionEn: 'Questions about physical/mental health and drugs. Usually No; if Yes, explain.',
    reminders: [
      { pt: 'Responda com sinceridade. Se Sim, detalhe no campo aberto.', en: 'Answer truthfully. If Yes, provide details in the opened field.' },
      { pt: 'A maioria marca No.', en: 'Most applicants answer No.' },
      { pt: 'Ao final: Next.', en: 'At the end: Next.' },
    ],
    fields: [
      {
        id: 'communicableDisease',
        type: 'radio',
        required: true,
        labelPt: 'Do you have a communicable disease of public health significance?',
        labelEn: 'Do you have a communicable disease of public health significance?',
        options: yesNoOptions,
      },
      { id: 'communicableDiseaseDetails', type: 'textarea', required: true, labelPt: 'Explique', labelEn: 'Explain', showWhen: { fieldId: 'communicableDisease', equals: 'yes' } },
      {
        id: 'mentalPhysicalDisorder',
        type: 'radio',
        required: true,
        labelPt: 'Do you have a mental or physical disorder that poses or is likely to pose a threat to the safety or welfare of yourself or others?',
        labelEn: 'Do you have a mental or physical disorder that poses or is likely to pose a threat to the safety or welfare of yourself or others?',
        options: yesNoOptions,
      },
      { id: 'mentalPhysicalDisorderDetails', type: 'textarea', required: true, labelPt: 'Explique', labelEn: 'Explain', showWhen: { fieldId: 'mentalPhysicalDisorder', equals: 'yes' } },
      { id: 'drugAbuserAddict', type: 'radio', required: true, labelPt: 'Are you or have you ever been a drug abuser or addict?', labelEn: 'Are you or have you ever been a drug abuser or addict?', options: yesNoOptions },
      { id: 'drugAbuserAddictDetails', type: 'textarea', required: true, labelPt: 'Explique', labelEn: 'Explain', showWhen: { fieldId: 'drugAbuserAddict', equals: 'yes' } },
    ],
  },
  {
    id: 'security-background-2',
    titlePt: 'Passo 14 — Security and Background: Part 2',
    titleEn: 'Step 14 — Security and Background: Part 2',
    descriptionPt: 'Perguntas sobre antecedentes criminais, drogas, prostituição, lavagem de dinheiro e tráfico humano.',
    descriptionEn: 'Questions about criminal history, drugs, prostitution, money laundering, and human trafficking.',
    reminders: [
      { pt: 'A maioria marca No. Se Sim, explique com clareza e consistência.', en: 'Most applicants answer No. If Yes, explain clearly and consistently.' },
      { pt: 'Não omita informações.', en: 'Do not omit information.' },
      { pt: 'Ao final: Next.', en: 'At the end: Next.' },
    ],
    fields: [
      { id: 'arrestedOrConvicted', type: 'radio', required: true, labelPt: 'Have you ever been arrested or convicted for any offense or crime, even though subject of a pardon, amnesty, or other similar action?', labelEn: 'Have you ever been arrested or convicted for any offense or crime, even though subject of a pardon, amnesty, or other similar action?', options: yesNoOptions },
      { id: 'arrestedOrConvictedDetails', type: 'textarea', required: true, labelPt: 'Explique', labelEn: 'Explain', showWhen: { fieldId: 'arrestedOrConvicted', equals: 'yes' } },
      { id: 'violatedDrugLaws', type: 'radio', required: true, labelPt: 'Have you ever violated, or engaged in a conspiracy to violate, any law relating to controlled substances?', labelEn: 'Have you ever violated, or engaged in a conspiracy to violate, any law relating to controlled substances?', options: yesNoOptions },
      { id: 'violatedDrugLawsDetails', type: 'textarea', required: true, labelPt: 'Explique', labelEn: 'Explain', showWhen: { fieldId: 'violatedDrugLaws', equals: 'yes' } },
      { id: 'prostitution', type: 'radio', required: true, labelPt: 'Are you coming to the United States to engage in prostitution or unlawful commercialized vice or have you been engaged in prostitution or procuring prostitutes within the past 10 years?', labelEn: 'Are you coming to the United States to engage in prostitution or unlawful commercialized vice or have you been engaged in prostitution or procuring prostitutes within the past 10 years?', options: yesNoOptions },
      { id: 'prostitutionDetails', type: 'textarea', required: true, labelPt: 'Explique', labelEn: 'Explain', showWhen: { fieldId: 'prostitution', equals: 'yes' } },
      { id: 'moneyLaundering', type: 'radio', required: true, labelPt: 'Have you ever been involved in, or do you seek to engage in, money laundering?', labelEn: 'Have you ever been involved in, or do you seek to engage in, money laundering?', options: yesNoOptions },
      { id: 'moneyLaunderingDetails', type: 'textarea', required: true, labelPt: 'Explique', labelEn: 'Explain', showWhen: { fieldId: 'moneyLaundering', equals: 'yes' } },
      { id: 'humanTraffickingOffense', type: 'radio', required: true, labelPt: 'Have you ever committed or conspired to commit a human trafficking offense in the United States or outside the United States?', labelEn: 'Have you ever committed or conspired to commit a human trafficking offense in the United States or outside the United States?', options: yesNoOptions },
      { id: 'humanTraffickingOffenseDetails', type: 'textarea', required: true, labelPt: 'Explique', labelEn: 'Explain', showWhen: { fieldId: 'humanTraffickingOffense', equals: 'yes' } },
      { id: 'aidedTrafficking', type: 'radio', required: true, labelPt: 'Have you ever knowingly aided, abetted, assisted or colluded with an individual who has committed, or conspired to commit a severe human trafficking offense in the United States or outside the United States?', labelEn: 'Have you ever knowingly aided, abetted, assisted or colluded with an individual who has committed, or conspired to commit a severe human trafficking offense in the United States or outside the United States?', options: yesNoOptions },
      { id: 'aidedTraffickingDetails', type: 'textarea', required: true, labelPt: 'Explique', labelEn: 'Explain', showWhen: { fieldId: 'aidedTrafficking', equals: 'yes' } },
      { id: 'benefitedFromTrafficking', type: 'radio', required: true, labelPt: 'Are you the spouse, son, or daughter of an individual who has committed or conspired to commit a human trafficking offense in the United States or outside the United States and have you within the last five years, knowingly benefited from the trafficking activities?', labelEn: 'Are you the spouse, son, or daughter of an individual who has committed or conspired to commit a human trafficking offense in the United States or outside the United States and have you within the last five years, knowingly benefited from the trafficking activities?', options: yesNoOptions },
      { id: 'benefitedFromTraffickingDetails', type: 'textarea', required: true, labelPt: 'Explique', labelEn: 'Explain', showWhen: { fieldId: 'benefitedFromTrafficking', equals: 'yes' } },
    ],
  },
  {
    id: 'security-background-3',
    titlePt: 'Passo 15 — Security and Background: Part 3',
    titleEn: 'Step 15 — Security and Background: Part 3',
    descriptionPt: 'Perguntas sobre terrorismo, violações graves e outras situações sensíveis. Geralmente é Não.',
    descriptionEn: 'Questions about terrorism, serious violations, and other sensitive topics. Usually No.',
    reminders: [
      { pt: 'Se alguma resposta for Sim, detalhe de forma objetiva.', en: 'If any answer is Yes, provide an objective explanation.' },
      { pt: 'A maioria marca No.', en: 'Most applicants answer No.' },
      { pt: 'Ao final: Next.', en: 'At the end: Next.' },
    ],
    fields: [
      { id: 'seekEspionage', type: 'radio', required: true, labelPt: 'Do you seek to engage in espionage, sabotage, export control violations, or any other illegal activity while in the United States?', labelEn: 'Do you seek to engage in espionage, sabotage, export control violations, or any other illegal activity while in the United States?', options: yesNoOptions },
      { id: 'seekEspionageDetails', type: 'textarea', required: true, labelPt: 'Explique', labelEn: 'Explain', showWhen: { fieldId: 'seekEspionage', equals: 'yes' } },
      { id: 'terroristActivities', type: 'radio', required: true, labelPt: 'Do you seek to engage in terrorist activities while in the United States or have you ever engaged in terrorist activities?', labelEn: 'Do you seek to engage in terrorist activities while in the United States or have you ever engaged in terrorist activities?', options: yesNoOptions },
      { id: 'terroristActivitiesDetails', type: 'textarea', required: true, labelPt: 'Explique', labelEn: 'Explain', showWhen: { fieldId: 'terroristActivities', equals: 'yes' } },
      { id: 'supportToTerrorists', type: 'radio', required: true, labelPt: 'Have you ever or do you intend to provide financial assistance or other support to terrorists or terrorist organizations?', labelEn: 'Have you ever or do you intend to provide financial assistance or other support to terrorists or terrorist organizations?', options: yesNoOptions },
      { id: 'supportToTerroristsDetails', type: 'textarea', required: true, labelPt: 'Explique', labelEn: 'Explain', showWhen: { fieldId: 'supportToTerrorists', equals: 'yes' } },
      { id: 'memberTerroristOrg', type: 'radio', required: true, labelPt: 'Are you a member or representative of a terrorist organization?', labelEn: 'Are you a member or representative of a terrorist organization?', options: yesNoOptions },
      { id: 'memberTerroristOrgDetails', type: 'textarea', required: true, labelPt: 'Explique', labelEn: 'Explain', showWhen: { fieldId: 'memberTerroristOrg', equals: 'yes' } },
      { id: 'familyTerroristIn5Years', type: 'radio', required: true, labelPt: 'Are you the spouse, son, or daughter of an individual who has engaged in terrorist activity, including providing financial assistance or other support to terrorists or terrorist organizations, in the last five years?', labelEn: 'Are you the spouse, son, or daughter of an individual who has engaged in terrorist activity, including providing financial assistance or other support to terrorists or terrorist organizations, in the last five years?', options: yesNoOptions },
      { id: 'familyTerroristIn5YearsDetails', type: 'textarea', required: true, labelPt: 'Explique', labelEn: 'Explain', showWhen: { fieldId: 'familyTerroristIn5Years', equals: 'yes' } },
      { id: 'genocide', type: 'radio', required: true, labelPt: 'Have you ever ordered, incited, committed, assisted, or otherwise participated in genocide?', labelEn: 'Have you ever ordered, incited, committed, assisted, or otherwise participated in genocide?', options: yesNoOptions },
      { id: 'genocideDetails', type: 'textarea', required: true, labelPt: 'Explique', labelEn: 'Explain', showWhen: { fieldId: 'genocide', equals: 'yes' } },
      { id: 'torture', type: 'radio', required: true, labelPt: 'Have you ever committed, ordered, incited, assisted, or otherwise participated in torture?', labelEn: 'Have you ever committed, ordered, incited, assisted, or otherwise participated in torture?', options: yesNoOptions },
      { id: 'tortureDetails', type: 'textarea', required: true, labelPt: 'Explique', labelEn: 'Explain', showWhen: { fieldId: 'torture', equals: 'yes' } },
      { id: 'extrajudicialKillings', type: 'radio', required: true, labelPt: 'Have you committed, ordered, incited, assisted, or otherwise participated in extrajudicial killings, political killings, or other acts of violence?', labelEn: 'Have you committed, ordered, incited, assisted, or otherwise participated in extrajudicial killings, political killings, or other acts of violence?', options: yesNoOptions },
      { id: 'extrajudicialKillingsDetails', type: 'textarea', required: true, labelPt: 'Explique', labelEn: 'Explain', showWhen: { fieldId: 'extrajudicialKillings', equals: 'yes' } },
      { id: 'childSoldiers', type: 'radio', required: true, labelPt: 'Have you ever engaged in the recruitment or the use of child soldiers?', labelEn: 'Have you ever engaged in the recruitment or the use of child soldiers?', options: yesNoOptions },
      { id: 'childSoldiersDetails', type: 'textarea', required: true, labelPt: 'Explique', labelEn: 'Explain', showWhen: { fieldId: 'childSoldiers', equals: 'yes' } },
      { id: 'religiousFreedomViolations', type: 'radio', required: true, labelPt: 'Have you, while serving as a government official, been responsible for or directly carried out, at any time, particularly severe violations of religious freedom?', labelEn: 'Have you, while serving as a government official, been responsible for or directly carried out, at any time, particularly severe violations of religious freedom?', options: yesNoOptions },
      { id: 'religiousFreedomViolationsDetails', type: 'textarea', required: true, labelPt: 'Explique', labelEn: 'Explain', showWhen: { fieldId: 'religiousFreedomViolations', equals: 'yes' } },
      { id: 'coercivePopulationControls', type: 'radio', required: true, labelPt: 'Have you ever been directly involved in the establishment or enforcement of population controls forcing a woman to undergo an abortion against her free choice or a man or a woman to undergo sterilization against his or her free will?', labelEn: 'Have you ever been directly involved in the establishment or enforcement of population controls forcing a woman to undergo an abortion against her free choice or a man or a woman to undergo sterilization against his or her free will?', options: yesNoOptions },
      { id: 'coercivePopulationControlsDetails', type: 'textarea', required: true, labelPt: 'Explique', labelEn: 'Explain', showWhen: { fieldId: 'coercivePopulationControls', equals: 'yes' } },
      { id: 'coerciveOrganTransplant', type: 'radio', required: true, labelPt: 'Have you ever been directly involved in the coercive transplantation of human organs or bodily tissue?', labelEn: 'Have you ever been directly involved in the coercive transplantation of human organs or bodily tissue?', options: yesNoOptions },
      { id: 'coerciveOrganTransplantDetails', type: 'textarea', required: true, labelPt: 'Explique', labelEn: 'Explain', showWhen: { fieldId: 'coerciveOrganTransplant', equals: 'yes' } },
    ],
  },
  {
    id: 'security-background-4',
    titlePt: 'Passo 16 — Security and Background: Part 4',
    titleEn: 'Step 16 — Security and Background: Part 4',
    descriptionPt: 'Perguntas sobre fraude/declaração falsa e deportação.',
    descriptionEn: 'Questions about fraud/misrepresentation and removal/deportation.',
    reminders: [
      { pt: 'Se Sim, explique com detalhes.', en: 'If Yes, explain with details.' },
      { pt: 'Responda com sinceridade.', en: 'Answer truthfully.' },
      { pt: 'Ao final: Next.', en: 'At the end: Next.' },
    ],
    fields: [
      { id: 'visaFraudOrMisrep', type: 'radio', required: true, labelPt: 'Have you ever sought to obtain or assist others to obtain a visa, entry into the United States, or any other United States immigration benefit by fraud or willful misrepresentation or other unlawful means?', labelEn: 'Have you ever sought to obtain or assist others to obtain a visa, entry into the United States, or any other United States immigration benefit by fraud or willful misrepresentation or other unlawful means?', options: yesNoOptions },
      { id: 'visaFraudOrMisrepDetails', type: 'textarea', required: true, labelPt: 'Explique', labelEn: 'Explain', showWhen: { fieldId: 'visaFraudOrMisrep', equals: 'yes' } },
      { id: 'removedOrDeported', type: 'radio', required: true, labelPt: 'Have you ever been removed or deported from any country?', labelEn: 'Have you ever been removed or deported from any country?', options: yesNoOptions },
      { id: 'removedOrDeportedDetails', type: 'textarea', required: true, labelPt: 'Explique', labelEn: 'Explain', showWhen: { fieldId: 'removedOrDeported', equals: 'yes' } },
    ],
  },
  {
    id: 'security-background-5',
    titlePt: 'Passo 17 — Security and Background: Part 5',
    titleEn: 'Step 17 — Security and Background: Part 5',
    descriptionPt: 'Perguntas finais de segurança e antecedentes. Geralmente é Não; se Sim, explique.',
    descriptionEn: 'Final security/background questions. Usually No; if Yes, explain.',
    reminders: [
      { pt: 'Responda com sinceridade. Se Sim, detalhe.', en: 'Answer truthfully. If Yes, provide details.' },
      { pt: 'Revise tudo no passo seguinte.', en: 'Review everything in the next step.' },
      { pt: 'Ao final: Next.', en: 'At the end: Next.' },
    ],
    fields: [
      { id: 'withheldCustodyUSChild', type: 'radio', required: true, labelPt: 'Have you ever withheld custody of a U.S. citizen child outside the United States from a person granted legal custody by a U.S. court?', labelEn: 'Have you ever withheld custody of a U.S. citizen child outside the United States from a person granted legal custody by a U.S. court?', options: yesNoOptions },
      { id: 'withheldCustodyUSChildDetails', type: 'textarea', required: true, labelPt: 'Explique', labelEn: 'Explain', showWhen: { fieldId: 'withheldCustodyUSChild', equals: 'yes' } },
      { id: 'votedInUS', type: 'radio', required: true, labelPt: 'Have you voted in the United States in violation of any law regulation?', labelEn: 'Have you voted in the United States in violation of any law regulation?', options: yesNoOptions },
      { id: 'votedInUSDetails', type: 'textarea', required: true, labelPt: 'Explique', labelEn: 'Explain', showWhen: { fieldId: 'votedInUS', equals: 'yes' } },
      { id: 'renouncedUSCitizenshipTax', type: 'radio', required: true, labelPt: 'Have you ever renounced United States citizenship for the purposes of avoiding taxation?', labelEn: 'Have you ever renounced United States citizenship for the purposes of avoiding taxation?', options: yesNoOptions },
      { id: 'renouncedUSCitizenshipTaxDetails', type: 'textarea', required: true, labelPt: 'Explique', labelEn: 'Explain', showWhen: { fieldId: 'renouncedUSCitizenshipTax', equals: 'yes' } },
    ],
  },
  {
    id: 'review-submit',
    titlePt: 'Passo 18 — Review',
    titleEn: 'Step 18 — Review',
    descriptionPt: 'Revise todas as informações. Se encontrar algo incorreto, volte e ajuste na etapa correspondente.',
    descriptionEn: 'Review all information. If you find anything incorrect, go back and adjust it in the corresponding step.',
    reminders: [
      { pt: 'Clique nas respostas no DS-160 oficial para editar (ele leva até a página correta).', en: 'In the official DS-160, click an answer to edit (it will take you to the correct page).' },
      { pt: 'Leia tudo com calma antes de finalizar.', en: 'Read everything carefully before finalizing.' },
      { pt: 'Após revisar, conclua a inscrição no site CEAC.', en: 'After reviewing, complete the application on the CEAC website.' },
    ],
    fields: [
      { id: 'reviewNotes', type: 'textarea', required: false, labelPt: 'Anotações (opcional)', labelEn: 'Notes (optional)' },
    ],
  },
];

export default function DS160Helper() {
  const { user, loading } = useAuth();
  const { credits, isAdmin, canAfford, spend, getCost } = useCredits();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({});
  const [viewMode, setViewMode] = useState<ViewMode>('both');
  const [savedTick, setSavedTick] = useState(false);
  const [featureUnlocked, setFeatureUnlocked] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState('');

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user || !isClient) return;
    if (isAdmin) {
      setFeatureUnlocked(true);
      return;
    }

    const key = `credit-unlock:ds160:${user.uid}`;
    setFeatureUnlocked(sessionStorage.getItem(key) === 'true');
  }, [user, isClient, isAdmin]);

  useEffect(() => {
    if (!isClient) return;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      setFormData(JSON.parse(saved));
    } catch (error) {
      console.error('Erro ao carregar DS-160 salvo:', error);
    }
  }, [isClient]);

  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData, isClient]);

  const current = STEPS[currentStep];

  const visibleFields = useMemo(
    () =>
      current.fields.filter((field) => {
        if (!field.showWhen) return true;
        return formData[field.showWhen.fieldId] === field.showWhen.equals;
      }),
    [current, formData]
  );

  const completion = useMemo(() => {
    const doneSteps = STEPS.filter((step) => {
      const required = step.fields.filter((field) => {
        if (!field.required) return false;
        if (!field.showWhen) return true;
        return formData[field.showWhen.fieldId] === field.showWhen.equals;
      });

      return required.every((field) => {
        const value = (formData[field.id] || '').trim();
        return value.length > 0;
      });
    }).length;

    return Math.round((doneSteps / STEPS.length) * 100);
  }, [formData]);

  const stepComplete = visibleFields
    .filter((field) => field.required)
    .every((field) => (formData[field.id] || '').trim().length > 0);

  const textByMode = (pt: string, en: string) => {
    if (viewMode === 'pt') return pt;
    if (viewMode === 'en') return en;
    return `${en} / ${pt}`;
  };

  const handleChange = (field: StepField, value: string) => {
    const nextValue = field.type === 'text' || field.type === 'textarea'
      ? stripAccents(value)
      : value;
    setFormData((prev) => ({ ...prev, [field.id]: nextValue }));
  };

  const saveProgress = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    setSavedTick(true);
    setTimeout(() => setSavedTick(false), 1800);
  };

  const exportData = () => {
    const dataStr = JSON.stringify(formData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ds160-guided-data.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearData = () => {
    if (!window.confirm('Tem certeza que deseja limpar todos os dados salvos do DS-160?')) return;
    setFormData({});
    localStorage.removeItem(STORAGE_KEY);
    if (user) sessionStorage.removeItem(`credit-unlock:ds160:${user.uid}`);
    setFeatureUnlocked(isAdmin);
  };

  const handleUnlockDS160 = async () => {
    if (!user || unlocking) return;
    if (!isAdmin && !canAfford('ds160')) {
      setUnlockError('Créditos insuficientes para liberar o DS-160.');
      router.push('/comprar-creditos');
      return;
    }

    setUnlocking(true);
    setUnlockError('');
    try {
      const success = await spend('ds160');
      if (!success) {
        setUnlockError('Não foi possível descontar os créditos neste momento.');
        return;
      }
      setFeatureUnlocked(true);
      sessionStorage.setItem(`credit-unlock:ds160:${user.uid}`, 'true');
      setShowUnlockModal(false);
    } catch (error) {
      console.error('Erro ao liberar DS-160:', error);
      setUnlockError('Erro ao liberar o assistente DS-160. Tente novamente.');
    } finally {
      setUnlocking(false);
    }
  };

  if (loading || !isClient) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-500">Carregando assistente DS-160...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) return null;

  return (
    <SubscriptionGuard>
      <Layout>
        <CreditGate
          feature="ds160"
          message="Assistente DS-160 em passos guiados com orientações bilíngues para cada campo."
        >
          {!isAdmin && !featureUnlocked ? (
            <div className="py-20 px-4">
              <div className="mx-auto max-w-xl bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-center">
                <h2 className="text-xl font-bold text-slate-900 mb-2">Desbloquear Assistente DS-160</h2>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  Confirme o desconto de {getCost('ds160')} créditos para iniciar este preenchimento guiado.
                </p>
                {unlockError && <p className="text-sm text-red-600 mb-3">{unlockError}</p>}
                <button
                  onClick={() => setShowUnlockModal(true)}
                  disabled={unlocking}
                  className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60"
                >
                  {unlocking ? 'Liberando...' : `Desbloquear (${getCost('ds160')} créditos)`}
                </button>
              </div>
            </div>
          ) : (
            <div className="py-10 px-4" style={{ background: 'linear-gradient(135deg, #F0F7FF 0%, #F8FAFC 50%, #F0F4FF 100%)' }}>
              <div className="mx-auto max-w-6xl">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-1">Assistente DS-160 Real</p>
                      <h1 className="text-2xl font-bold text-slate-900">Preenchimento em {STEPS.length} passos guiados</h1>
                      <p className="text-slate-500 text-sm mt-1">
                        Campos em inglês com explicação em português. Textos sem acentos para compatibilidade.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 rounded-lg px-3 py-1.5">
                        <HiLanguage className="w-4 h-4" /> Visualização
                      </div>
                      <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
                        {([
                          { id: 'pt', label: 'PT' },
                          { id: 'en', label: 'EN' },
                          { id: 'both', label: 'PT + EN' },
                        ] as const).map((v) => (
                          <button
                            key={v.id}
                            onClick={() => setViewMode(v.id)}
                            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                              viewMode === v.id
                                ? 'bg-white shadow text-slate-900'
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                          >
                            {v.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${completion}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500">{completion}% concluído</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div className="lg:col-span-1">
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 sticky top-24">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Etapas</p>
                      <div className="space-y-2">
                        {STEPS.map((step, index) => {
                          const active = index === currentStep;
                          return (
                            <button
                              key={step.id}
                              onClick={() => setCurrentStep(index)}
                              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm border transition-colors ${
                                active
                                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                                  : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              <p className="font-semibold">{index + 1}. {viewMode === 'en' ? step.titleEn : step.titlePt}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-3">
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-5">
                      <h2 className="text-xl font-bold text-slate-900 mb-1">
                        {textByMode(current.titlePt, current.titleEn)}
                      </h2>
                      <p className="text-sm text-slate-600 mb-4">
                        {textByMode(current.descriptionPt, current.descriptionEn)}
                      </p>

                      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-5">
                        <p className="text-xs font-semibold text-blue-700 mb-2 uppercase tracking-wide">Orientações</p>
                        <ul className="space-y-1.5 text-sm text-blue-800">
                          {current.reminders.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <HiCheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-blue-500" />
                              <span>{textByMode(item.pt, item.en)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-4">
                        {visibleFields.map((field) => (
                          <div key={field.id}>
                            <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                              {textByMode(field.labelPt, field.labelEn)}
                              {field.required && <span className="text-red-500 ml-1">*</span>}
                            </label>

                            {field.type === 'text' && (
                              <Input
                                type="text"
                                value={formData[field.id] || ''}
                                onChange={(e) => handleChange(field, e.target.value)}
                                placeholder={textByMode(field.placeholderPt || '', field.placeholderEn || '')}
                              />
                            )}

                            {field.type === 'date' && (
                              <Input
                                type="date"
                                value={formData[field.id] || ''}
                                onChange={(e) => handleChange(field, e.target.value)}
                              />
                            )}

                            {field.type === 'textarea' && (
                              <textarea
                                rows={3}
                                value={formData[field.id] || ''}
                                onChange={(e) => handleChange(field, e.target.value)}
                                placeholder={textByMode(field.placeholderPt || '', field.placeholderEn || '')}
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                              />
                            )}

                            {(field.type === 'radio' || field.type === 'select') && (
                              <>
                                {field.type === 'select' ? (
                                  <select
                                    value={formData[field.id] || ''}
                                    onChange={(e) => handleChange(field, e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                  >
                                    <option value="">{viewMode === 'en' ? 'Select an option' : 'Selecione uma opção'}</option>
                                    {field.options?.map((option) => (
                                      <option key={option.value} value={option.value}>
                                        {textByMode(option.labelPt, option.labelEn)}
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <div className="flex flex-wrap gap-2">
                                    {field.options?.map((option) => (
                                      <label
                                        key={option.value}
                                        className="inline-flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 text-sm cursor-pointer hover:bg-slate-50"
                                      >
                                        <input
                                          type="radio"
                                          name={field.id}
                                          value={option.value}
                                          checked={(formData[field.id] || '') === option.value}
                                          onChange={(e) => handleChange(field, e.target.value)}
                                        />
                                        {textByMode(option.labelPt, option.labelEn)}
                                      </label>
                                    ))}
                                  </div>
                                )}
                              </>
                            )}

                            <p className="text-xs text-slate-500 mt-1.5">
                              {textByMode(
                                field.helpPt || 'Sem acentos. Use dados consistentes com documentos oficiais.',
                                field.helpEn || 'No accents. Use data consistent with official documents.'
                              )}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5 flex items-start gap-3">
                      <HiExclamationTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-amber-800 mb-1">Importante</p>
                        <p className="text-xs text-amber-700 leading-relaxed">
                          {textByMode(
                            'Sempre clique em Save ao finalizar uma etapa para evitar perda de dados se a sessão cair.',
                            'Always click Save after finishing each step to avoid losing data if session drops.'
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))} disabled={currentStep === 0}>
                          <HiArrowLeft className="w-4 h-4 mr-1" /> {viewMode === 'en' ? 'Previous' : 'Anterior'}
                        </Button>
                        <Button
                          onClick={() => setCurrentStep((prev) => Math.min(STEPS.length - 1, prev + 1))}
                          disabled={currentStep === STEPS.length - 1 || !stepComplete}
                        >
                          {viewMode === 'en' ? 'Next' : 'Próximo'} <HiArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={saveProgress}>
                          {savedTick ? 'Saved' : 'Save'}
                        </Button>
                        <Button variant="outline" onClick={exportData}>
                          <FiDownload className="w-4 h-4 mr-1" /> {viewMode === 'en' ? 'Export' : 'Exportar'}
                        </Button>
                        <Button variant="outline" onClick={clearData} className="text-red-600 border-red-200 hover:bg-red-50">
                          <FiTrash2 className="w-4 h-4 mr-1" /> {viewMode === 'en' ? 'Clear' : 'Limpar'}
                        </Button>
                      </div>
                    </div>

                    <div className="mt-6 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-600 flex items-start gap-2">
                      <HiInformationCircle className="w-4 h-4 shrink-0 mt-0.5 text-slate-500" />
                      <span>
                        {textByMode(
                          'Este assistente organiza seu preenchimento. A submissão oficial deve ser feita no site CEAC.',
                          'This assistant organizes your preparation. Official submission must be done on CEAC website.'
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <CreditConfirmModal
            open={showUnlockModal}
            featureLabel="Assistente DS-160"
            cost={getCost('ds160')}
            credits={credits}
            loading={unlocking}
            onCancel={() => setShowUnlockModal(false)}
            onConfirm={handleUnlockDS160}
          />
        </CreditGate>
      </Layout>
    </SubscriptionGuard>
  );
}
