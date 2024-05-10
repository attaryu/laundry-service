import jwt from 'jsonwebtoken';

import { serverError } from '../lib/responseReuse.js';
import { outlet, pelanggan, transaksi, user } from '../models/index.js';

const day = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jum\'at', 'Sabtu'];

export async function graphService(requestToken: string) {
  const token: any = jwt.decode(requestToken);

  if (/kasir/.test(token.role)) {
    return {
      code: 401,
      message: 'anda bukan admin atau manajer',
    };
  }

  const msPerDay = 24 * 60 * 60 * 1000;
  const today = new Date();
  const dayIndex = today.getDay();
  const month = zeroFormat(today.getMonth() + 1);
  const year = today.getFullYear();

  const currentSunday = today.getTime() - msPerDay * dayIndex;
  const currentSaturday = currentSunday + msPerDay * 7;
  const pastSunday = currentSunday - msPerDay * 7;
  const pastSaturday = pastSunday + msPerDay * 7;

  const dateCurrentSunday = zeroFormat(new Date(currentSunday).getDate() - 1);
  const dateCurrentSaturday = zeroFormat(new Date(currentSaturday).getDate());
  const datePastSunday = zeroFormat(new Date(pastSunday).getDate() - 1);
  const datePastSaturday = zeroFormat(new Date(pastSaturday).getDate());

  const currentFrom = `${year}-${month}-${dateCurrentSunday}T17:00:00.000Z`;
  const currentUntil = `${year}-${month}-${dateCurrentSaturday}T17:00:00.000Z`;
  const pastFrom = `${year}-${month}-${datePastSunday}T17:00:00.000Z`;
  const pastUntil = `${year}-${month}-${datePastSaturday}T17:00:00.000Z`;

  try {
    const currentData = await transaksi.findMany({
      where: {
        tanggal: {
          gte: currentFrom,
          lte: currentUntil,
        },
      },
      orderBy: {
        tanggal: 'desc',
      },
    });

    const pastData = await transaksi.findMany({
      where: {
        tanggal: {
          gte: pastFrom,
          lte: pastUntil,
        },
      },
      orderBy: {
        tanggal: 'desc',
      },
    });

    const countDataPerDayThisWeeks: number[] = [];
    const countDataPerDayLastWeek: number[] = [];

    for (let i = 1; i <= 7; i++) {
      const trackedDateThisWeeks = dateTracker(currentFrom, i);
      const trackedDateLastWeek = dateTracker(pastFrom, i);

      countDataPerDayThisWeeks.push(
        currentData.filter((data) => {
          const tanggal = data.tanggal.getTime();

          if (
            tanggal > trackedDateThisWeeks.from &&
            tanggal < trackedDateThisWeeks.until
          ) {
            return data;
          }
        }).length
      );

      countDataPerDayLastWeek.push(
        pastData.filter((data) => {
          const tanggal = data.tanggal.getTime();

          if (
            tanggal > trackedDateLastWeek.from &&
            tanggal < trackedDateLastWeek.until
          ) {
            return data;
          }
        }).length
      );
    }

    const processedData = {
      graph: countDataPerDayThisWeeks.map((data, i) => ({
        name: day[i],
        thisWeeks: data === 0 ? null : data,
        lastWeek: countDataPerDayLastWeek[i] === 0 ? null : countDataPerDayLastWeek[i],
      })),
    };

    return {
      code: 200,
      message: 'ok',
      payload: processedData,
    };
  } catch (error) {
    console.error(error);

    return serverError();
  }
}

export async function totalDataService(requestToken: string) {
  const token: any = jwt.decode(requestToken);

  if (/kasir/.test(token.role)) {
    return {
      code: 401,
      message: 'anda bukan admin atau manajer',
    };
  }

  try {
    const totalCustomer = await pelanggan.count();
    const totalOutlet = await outlet.count();
    const totalStaff = await user.count();
    const totalTransaction = await transaksi.count();

    return {
      code: 201,
      payload: {
        pelanggan: totalCustomer,
        outlet: totalOutlet,
        staff: totalStaff,
        transaksi: totalTransaction
      }
    }
  } catch (error) {
    console.error(error);

    return serverError();
  }
}

export async function incomeService(requestToken: string, query: any) {
  const token: any = jwt.decode(requestToken);

  if (/kasir/.test(token.role)) {
    return {
      code: 401,
      message: 'anda bukan admin atau manajer',
    };
  }

  let todayQuery = {};
  
  console.log(query.today);
  if (query.today === 'true') {
    const today = new Date();

    const gte = new Date(today.getTime() - (24 * 60 * 60 * 1000)).toISOString().split('T')[0];
    const lte = new Date(today).toISOString().split('T')[0];

    todayQuery = {
      tanggal: {
        gte: `${gte}T17:00:00.000Z`,
        lte: `${lte}T16:59:59.999Z`,
      }
    }
  }

  try {
    const totalTransaction = await transaksi.findMany({
      where: todayQuery,
      select: {
        total: true,
      },
    });

    if (!totalTransaction) {
      return {
        code: 404,
        message: 'tidak ada transaksi',
      }
    }

    return {
      code: 201,
      payload: {
        total: totalTransaction.reduce((pre, data) => data.total + pre, 0),
      }
    }
  } catch (error) {
    console.error(error);

    return serverError();
  }
}

// util

function dateTracker(rawDate: string, fromNow: number) {
  const date = new Date(rawDate);
  const msPerDay = 24 * 60 * 60 * 1000;

  const trackedMinusOne = new Date(date.getTime() + msPerDay * (fromNow - 1))
    .toISOString()
    .split('T')[0];
  const tracked = new Date(date.getTime() + msPerDay * fromNow)
    .toISOString()
    .split('T')[0];

  return {
    from: new Date(`${trackedMinusOne}T17:00:00.000Z`).getTime(),
    until: new Date(`${tracked}T17:00:00.000Z`).getTime(),
  };
}

function zeroFormat(date: number) {
  return String(date).length === 1 ? `0${date}` : date;
}
