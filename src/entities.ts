export interface Parking {
  id: number;

  parkingSlotId: number;

  vehicleId: number;

  timeIn: Date;

  timeOut: Date;

  createdAt: Date;

  updatedAt: Date;

  __parkingSlot__: ParkingSlot;

  __vehicle__: Vehicle;

  fee: number;
}

export enum ParkingType {
  Small = 'small',
  Medium = 'medium',
  Large = 'large'
}

export interface ParkingSlot {
  id: number;

  name: string;

  parkingType: ParkingType;

  status: string;

  createdAt: Date;

  updatedAt: Date;
}

export enum VehicleType {
  Small = 'small',
  Medium = 'medium',
  Large = 'large'
}

export interface Vehicle {
  id: number;

  plateNumber: string;

  vehicleType: VehicleType;

  createdAt: Date;

  updatedAt: Date;
}

export interface EntryPoint {
  id: number;

  name: string;

  createdAt: Date;

  updatedAt: Date;
}

export interface CreateVehicleParkingInput {
  plateNumber?: string;

  vehicleType?: VehicleType;

  entryPointId?: number;
}

export type CreateVehicleParkingInputKeys = keyof CreateVehicleParkingInput;
