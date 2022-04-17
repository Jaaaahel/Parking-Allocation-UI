import { useEffect, useImperativeHandle, useRef, useState } from 'react';
import useAxios from 'axios-hooks';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  forwardRef,
  ListItem,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  UnorderedList,
  useDisclosure
} from '@chakra-ui/react';
import { Parking } from '../entities';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { getInstance } from '../services/api';

dayjs.extend(relativeTime);

export interface ParkingsTableComponentRefType {
  refetch: () => void;
}

const ParkingsTableComponent = forwardRef((props, ref) => {
  const api = getInstance();

  const [parkings, setParkings] = useState<Parking[]>([]);
  const [currentParking, setCurrentParking] = useState<Parking>();

  const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure();
  const confirmCancelRef = useRef(null);

  const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure();
  const detailsCancelRef = useRef(null);

  const [{ data: parkingsResponse }, refetch] = useAxios('/parkings');

  useEffect(() => {
    if (parkingsResponse !== undefined) {
      setParkings(parkingsResponse);
    }
  }, [parkingsResponse]);

  useImperativeHandle(
    ref,
    (): ParkingsTableComponentRefType => ({
      refetch: () => refetch()
    })
  );

  const confirmTimeOut = (parking: Parking) => {
    setCurrentParking(parking);
    onConfirmOpen();
  };

  const timeOut = async (parking: Parking) => {
    onConfirmClose();

    const { data: createParkingResponse } = await api.post<Parking>('/parkings', {
      entryPointId: 0,
      vehicleId: parking.vehicleId,
      action: 'timeOut'
    });

    setCurrentParking(createParkingResponse);
    onDetailsOpen();

    refetch();
  };

  return (
    <>
      <AlertDialog
        isOpen={isConfirmOpen}
        leastDestructiveRef={confirmCancelRef}
        onClose={onConfirmClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Time Out
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to time out? You can't undo this action afterwards.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={confirmCancelRef} onClick={onConfirmClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={() => currentParking && timeOut(currentParking)}
                ml={3}
              >
                Time Out
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      <AlertDialog
        isOpen={isDetailsOpen}
        leastDestructiveRef={detailsCancelRef}
        onClose={onDetailsClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Parking Details
            </AlertDialogHeader>

            <AlertDialogBody>
              <UnorderedList>
                <ListItem>Plate Number: {currentParking?.__vehicle__.plateNumber}</ListItem>
                <ListItem>
                  Time In: {dayjs(currentParking?.timeIn).format('YYYY-MM-DD HH:mm:ss')}
                </ListItem>
                <ListItem>
                  Time Out: {dayjs(currentParking?.timeOut).format('YYYY-MM-DD HH:mm:ss')}
                </ListItem>
                <ListItem>Fee: {currentParking?.fee}</ListItem>
              </UnorderedList>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button colorScheme="red" onClick={onDetailsClose} ml={3}>
                Okay
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Plate Number</Th>
              <Th>Vehicle Type</Th>
              <Th>Parking Type</Th>
              <Th>Parking Duration</Th>
              <Th>Time In</Th>
              <Th>Time Out</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {parkings.map((parking, i) => (
              <Tr key={i}>
                <Td>{parking.__vehicle__.plateNumber}</Td>
                <Td>{parking.__vehicle__.vehicleType}</Td>
                <Td>{parking.__parkingSlot__.parkingType}</Td>
                <Td>
                  {parking.timeOut !== null
                    ? dayjs(parking.timeIn).to(parking.timeOut, true)
                    : dayjs(parking.timeIn).fromNow(true)}
                </Td>
                <Td>{dayjs(parking.timeIn).format('YYYY-MM-DD HH:mm:ss')}</Td>
                <Td>
                  {parking.timeOut ? dayjs(parking.timeOut).format('YYYY-MM-DD HH:mm:ss') : 'NA'}
                </Td>
                <Td>
                  <Button
                    onClick={() => confirmTimeOut(parking)}
                    colorScheme="teal"
                    size="md"
                    disabled={parking.timeOut !== null}
                  >
                    {parking.timeOut !== null ? 'Timed Out' : 'Time Out'}
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </>
  );
});

export default ParkingsTableComponent;
