import { FC, FormEvent, useEffect, useState } from "react";
import useAxios from "axios-hooks";
import {
  Alert,
  AlertIcon,
  Button,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Radio,
  RadioGroup,
  Select,
  Stack,
} from "@chakra-ui/react";
import {
  CreateVehicleParkingInput,
  CreateVehicleParkingInputKeys,
  EntryPoint,
  Parking,
  Vehicle,
} from "../entities";
import { getInstance, isAxiosError } from "../services/api";

export interface AddParkingComponentProps {
  onParkingCreate: Function;
}

const AddParkingComponent: FC<AddParkingComponentProps> = (props) => {
  const api = getInstance();

  const [entryPoints, setEntryPoints] = useState<EntryPoint[]>([]);
  const [parking, setParking] = useState<CreateVehicleParkingInput>();
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessages, setErrorMessages] = useState<string[]>();

  const [{ data: entryPointsResponse }] = useAxios("/entrypoints");

  useEffect(() => {
    if (entryPointsResponse !== undefined) {
      setEntryPoints(entryPointsResponse);
    }
  }, [entryPointsResponse]);

  const setFieldValue = (key: CreateVehicleParkingInputKeys, value: string) => {
    let currentParking = parking;

    if (!currentParking) {
      currentParking = {};
    }

    Object.assign(currentParking, { [key]: value });

    setParking(currentParking);
  };

  const submitForm = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessages([]);
    setLoading(true);

    const getVehicleByPlateNumber = async (
      plateNumber?: string
    ): Promise<Vehicle | undefined> => {
      try {
        const { data: getVehicleResponse } = await api.get(
          `/vehicles/plateNumber/${plateNumber}`
        );

        return getVehicleResponse;
      } catch (e: any) {
        return undefined;
      }
    };

    try {
      let vehicle = await getVehicleByPlateNumber(parking?.plateNumber);

      if (vehicle && vehicle?.vehicleType !== parking?.vehicleType) {
        setErrorMessages(["Vehicle with the same plate number already exist"]);
        return;
      }

      if (!vehicle) {
        const { data: createVehicleResponse } = await api.post<Vehicle>(
          "/vehicles",
          {
            plateNumber: parking?.plateNumber,
            vehicleType: parking?.vehicleType,
          }
        );

        vehicle = createVehicleResponse;
      }

      const { data: createParkingResponse } = await api.post<Parking>(
        "/parkings",
        {
          entryPointId: Number(parking?.entryPointId),
          vehicleId: vehicle.id,
          action: "timeIn",
        }
      );

      if (props.onParkingCreate) {
        props.onParkingCreate(createParkingResponse);
      }
    } catch (e: any) {
      if (isAxiosError(e)) {
        let message = e.response.data.message;

        if (typeof message === "string") {
          message = [message];
        }

        setErrorMessages(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submitForm}>
      <Stack spacing={3}>
        {errorMessages?.map((message, i) => (
          <Alert status="error" key={i}>
            <AlertIcon />
            {message}
          </Alert>
        ))}
      </Stack>

      <FormControl mb={2} isRequired>
        <FormLabel>Plate Number</FormLabel>
        <Input
          id="plate-number"
          placeholder="Plate Number"
          onChange={(e) => setFieldValue("plateNumber", e.target.value)}
        />
      </FormControl>

      <FormControl mb={2} isRequired>
        <FormLabel>Vehicle Type</FormLabel>
        <RadioGroup onChange={(e) => setFieldValue("vehicleType", e)}>
          <HStack spacing="50px">
            <Radio value="small">Small</Radio>
            <Radio value="medium">Medium</Radio>
            <Radio value="large">Large</Radio>
          </HStack>
        </RadioGroup>
      </FormControl>

      {/* <FormControl mb={2} isRequired>
        <FormLabel>Parking Type</FormLabel>
        <RadioGroup mb={2}}>
          <HStack spacing="50px">
            <Radio value="Small">Small</Radio>
            <Radio value="Medium">Medium</Radio>
            <Radio value="Large">Large</Radio>
          </HStack>
        </RadioGroup>
      </FormControl> */}

      <FormControl mb={2} isRequired>
        <FormLabel>Entry Point</FormLabel>
        <Select
          placeholder="Select entry point"
          onChange={(e) => setFieldValue("entryPointId", e.target.value)}
        >
          {entryPoints.map((entryPoint, i) => (
            <option value={entryPoint.id} key={i}>
              {entryPoint.name}
            </option>
          ))}
        </Select>
      </FormControl>

      <Button type="submit" colorScheme="teal" size="md" isLoading={loading}>
        Submit
      </Button>
    </form>
  );
};

export default AddParkingComponent;
