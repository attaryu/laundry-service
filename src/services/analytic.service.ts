import jwt from 'jsonwebtoken';

import { serverError } from '../lib/responseReuse.js';
import { outlet, pelanggan, transaksi, user } from '../models/index.js';

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

  const currentSunday = today.getTime() - msPerDay * dayIndex;
  const currentSaturday = currentSunday + msPerDay * 7;
  const pastSunday = currentSunday - msPerDay * 7;
  const pastSaturday = pastSunday + msPerDay * 7;

  const currentFrom = `${new Date(currentSunday).toISOString().split('T')[0]
    }T17:00:00.000Z`;
  const currentUntil = `${new Date(currentSaturday).toISOString().split('T')[0]
    }T16:59:59.999Z`;
  const pastFrom = `${new Date(pastSunday).toISOString().split('T')[0]
    }T17:00:00.000Z`;
  const pastUntil = `${new Date(pastSaturday).toISOString().split('T')[0]
    }T16:59:59.999Z`;

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

    const countDataPerDayThisWeeks = [];
    const countDataPerDayLastWeek = [];

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
      graph: {
        thisWeeks: countDataPerDayThisWeeks,
        lastWeeks: countDataPerDayLastWeek,
      },
    };

    return {
      code: 200,
      message: 'ok',
      payload: processedData.graph,
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
  
  if (query.today === 'true') {
    const today = new Date().toLocaleString().split(', ')[0];

    todayQuery = {
      tanggal: {
        gte: new Date(`${today}, 00:00:00`).toISOString(),
        lte: new Date(`${today}, 23:59:59`).toISOString(),
      }
    }
  }

  try {
    const totalTransaction = await transaksi.groupBy({
      by: ['total'],
      _sum: {
        total: true,
      },
      where: todayQuery,
    });

    if (totalTransaction) {
      return {
        code: 404,
        message: 'tidak ada transaksi',
      }
    }

    return {
      code: 201,
      payload: {
        total: totalTransaction
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
    until: new Date(`${tracked}T16:59:59.999Z`).getTime(),
  };
}
