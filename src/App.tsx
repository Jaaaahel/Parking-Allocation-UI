import { Grid, GridItem } from "@chakra-ui/react";
import { createRef } from "react";
import AddParkingComponent from "./components/AddParkingComponent";
import ParkingsTableComponent, {
  ParkingsTableComponentRefType,
} from "./components/ParkingsTableComponent";
import { Parking } from "./entities";

function App() {
  const parkingsTableRef = createRef<ParkingsTableComponentRefType>();

  const onParkingCreate = (data: Parking) => {
    if (parkingsTableRef.current) {
      parkingsTableRef.current.refetch();
    }
  };

  return (
    <Grid
      h="200px"
      templateRows="repeat(2, 1fr)"
      templateColumns="repeat(5, 1fr)"
      gap={4}
    >
      <GridItem rowSpan={2} colSpan={1} p={4}>
        <AddParkingComponent onParkingCreate={onParkingCreate} />
      </GridItem>

      <GridItem colSpan={4} p={4}>
        <ParkingsTableComponent ref={parkingsTableRef} />
      </GridItem>
    </Grid>
  );
}

export default App;
