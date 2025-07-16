export interface IAddress {
  name: string;
  street: string;
  number: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault?: boolean;
}