import {Document , Model} from 'mongoose';

interface MonthData{
    month: string;
    count: number;
}

export async function generateaLast12MonthsData<T extends Document>(
    model: Model<T>
): Promise<{Last12Months:MonthData[]}> {
    const Last12Months: MonthData[] = [];
    const currentDate = new Date();
    currentDate.setMonth(currentDate.getMonth() + 1); 

    for(let i =11 ; i >= 0 ; i--){
        const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() ,currentDate.getDate() - i * 28);
        const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() , currentDate.getDate() - 28);

        const monthYear =  endDate.toLocaleString('default', { day:"numeric", month: 'short', year: 'numeric' });

        const count = await model.countDocuments({
            createdAt: {
                $gte: startDate,
                $lt: endDate
            }
        });

        Last12Months.push({ month: monthYear, count });
    }

    return { Last12Months };
}