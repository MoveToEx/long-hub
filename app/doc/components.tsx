import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

export function DataTable({
    head, data
}: {
    head: string[],
    data: React.ReactElement[][]
}) {
    return (
        <TableContainer component={Paper} sx={{margin: '6px'}}>
            <Table sx={{ minWidth: 650 }}>
                <TableHead>
                    <TableRow>
                        {
                            head.map((x, i) => (
                                <TableCell align="center" sx={{fontWeight: 'bold'}} key={i.toString()}>
                                    {x}
                                </TableCell>
                            ))
                        }
                    </TableRow>
                </TableHead>
                <TableBody>
                    {
                        data.map((x, i) => (
                            <TableRow key={i.toString()}>
                                {
                                    x.map((y, j) => (
                                        <TableCell align="center" key={j.toString()}>
                                            {y}
                                        </TableCell>
                                    ))
                                }
                            </TableRow>
                        ))
                    }
                </TableBody>
            </Table>
        </TableContainer>
    )
}