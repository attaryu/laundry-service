import jwt from 'jsonwebtoken';

import nanoid from '../lib/customNanoid.js';
import propertyChecker from '../lib/propertyChecker.js';
import { serverError } from '../lib/responseReuse.js';
import { logSurat, surat } from '../models/index.js';

export async function createEmailService({ requestToken, body }: createEmailService) {
  const token: any = jwt.decode(requestToken);

  const propertyCorrect = propertyChecker(body, {
    penerima: 'string',
    judul: 'string',
    body: 'string',
    penting: 'boolean',
  });

  if (propertyCorrect && typeof propertyCorrect !== 'boolean') {
    return propertyCorrect;
  }
  
  if (!/kasir|manajer|admin|all/.test(body.penerima)) {
    return {
      code: 400,
      message: 'penerima hanya kasir, manajer, dan admin',
    }
  }

  try {
    const payload = await surat.create({
      data: {
        id: nanoid(),
        id_pengirim: token.id,
        arsip: '',
        dibaca: '',
        ...body,
      },
      select: {
        id: true,
        id_pengirim: true,
        penerima: true,
        penting: true,
        judul: true,
        body: true,
        arsip: true,
        dibaca: true,
        tanggal: true,
      },
    });

    await logSurat.create({
      data: {
        id_surat: payload.id,
        id_user: token.id,
      }
    });

    return {
      code: 201,
      message: 'surat berhasil dibuat',
      payload,
    }
  } catch (error) {
    console.error(error);

    return serverError();
  }
}

interface createEmailService {
  requestToken: string,
  body: {
    penerima: 'kasir' | 'manajer' | 'admin' | 'all',
    judul: string,
    body: string,
    penting: boolean,
  },
}

export async function getAllEmailService({ requestToken, query }: getAllEmailService) { 
  const token: any = jwt.decode(requestToken);
  let filter: any = {
    OR: [
      {
        penerima: 'kasir',
      },
      {
        penerima: 'all',
      },
      {
        id_pengirim: token.id,
      }
    ],
  };

  if (query.archive === 'true') {
    filter = {
      ...filter,
      arsip: {
        contains: token.id
      },
    }
  } else if (query.archive === 'false') {
    filter = {
      ...filter,
      NOT: [
        {
          arsip: {
            contains: token.id
          },
        }
      ]
    }
  }
  
  try {
    let payload;
    const select = {
      id: true,
      judul: true,
      body: true,
      dibaca: true,
      arsip: true,
      tanggal: true,
      penting: true,
      tb_user: {
        select: {
          id: true,
          name: true,
        }
      }
    };

    switch (token.role) {
      case 'manajer':
        case 'admin':
          payload = await surat.findMany({ select });
          break;
      default:
        payload = await surat.findMany({
          where: filter,
          select,
        });
    }

    return {
      code: 200,
      message: 'berhasil',
      payload: payload?.map((mail) => ({
        ...mail,
        arsip: mail.arsip.split(' ').includes(token.id),
        dibaca: mail.dibaca.split(' ').includes(token.id),
      })),
    }
  } catch (error) {
    console.error(error);

    return serverError();
  }
}

interface getAllEmailService {
  requestToken: string,
  query: {
    archive: string,
  }
}

export async function getSpecificEmailService({requestToken, params}: getSpecificEmailService) {
  const token: any = jwt.decode(requestToken);

  if (!params.emailId) {
    return {
      code: 400,
      message: 'parameter emailId harus di cantumkan',
    }
  }

  try {
    const payload = await surat.findFirst({
      where: {
        id: params.emailId,
        OR: [
          {
            penerima: token.role,
          },
          {
            penerima: 'all',
          },
        ],
      },
      select: {
        id: true,
        judul: true,
        body: true,
        dibaca: true,
        arsip: true,
        tanggal: true,
        penting: true,
        penerima: true,
        tb_user: {
          select: {
            id: true,
            name: true,
            username: true,
            role: true,
          }
        }
      }
    });

    if (!payload) {
      return {
        code: 404,
        message: `surat dengan id ${params.emailId} tidak ditemukan`,
      }
    }

    return {
      code: 200,
      message: 'berhasil',
      payload: {
        ...payload,
        arsip: payload.arsip.split(' ').includes(token.id),
        dibaca: payload.dibaca.split(' ').includes(token.id),
      },
    }
  } catch (error) {
    console.error(error);

    return serverError();
  }
}

interface getSpecificEmailService {
  requestToken: string,
  params: {
    emailId: string,
  },
}

export async function deleteEmailService({ requestToken, body }: deleteEmailService) {
  const token: any = jwt.decode(requestToken);

  if (Array.isArray(body.id) && body.id.length === 0) {
    return {
      code: 400,
      message: 'property id tidak boleh kosong',
    }
  }

  try {
    if (/manajer|kasir/.test(token.role)) {
      body.id.forEach(async (emailId) => {
        await surat.deleteMany({
          where: {
            id: emailId,
            id_pengirim: token.id,
          },
        });
      });
    } else if (/admin/) {
      body.id.forEach(async (emailId) => {
        await surat.deleteMany({
          where: {
            id: emailId,
          },
        });
      });
    }

    return {
      code: 200,
      message: `email dengan id ${body.id.join(', ')} berhasil di hapus`,
    }
  } catch (error) {
    console.error(error);

    return serverError();
  }
}

interface deleteEmailService {
  requestToken: string,
  body: {
    id: string[],
  }
}

export async function archiveEmailService({ requestToken, params }: archiveEmailService) {
  const token: any = jwt.decode(requestToken);

  if (!params.emailId) {
    return {
      code: 400,
      message: 'parameter emailId harus di cantumkan',
    }
  }

  if (!/true|false/.test(params.archive)) {
    return {
      code: 400,
      message: 'parameter archive hanya boleh bernilai true dan false',
    }
  }

  try {
    const existingEmail = await surat.findFirst({
      where: {
        id: params.emailId,
        OR: [
          {
            penerima: token.role,
          },
          {
            penerima: 'all',
          },
        ]
      },
      select: {
        arsip: true,
      }
    });

    if (!existingEmail) {
      return {
        code: 404,
        message: `email dengan id ${params.emailId} tidak ditemukan`,
      }
    }

    const oldArchive = existingEmail.arsip.split(' ');
    let newArchive;

    if (params.archive === 'true') {
      newArchive = [...oldArchive, token.id].join(' ');
    } else {
      newArchive = oldArchive.filter((id) => id !== token.id).join(' ');
    }

    const payload = await surat.update({
      where: {
        id: params.emailId,
      },
      data: {
        arsip: newArchive,
      },
      select: {
        id: true,
        judul: true,
        body: true,
        dibaca: true,
        arsip: true,
        tanggal: true,
        penting: true,
        penerima: true,
        tb_user: {
          select: {
            id: true,
            name: true,
            username: true,
            role: true,
          }
        }
      }
    });

    return {
      code: 200,
      message: 'ok',
      payload: {
        ...payload,
        arsip: payload.arsip.split(' ').includes(token.id),
        dibaca: payload.dibaca.split(' ').includes(token.id),
      }
    }
  } catch (error) {
    console.error(error);

    return serverError();
  }
}

interface archiveEmailService {
  requestToken: string,
  params: {
    emailId: string,
    archive: string,
  },
}

export async function readEmailService({ requestToken, params }: readEmailService) {
  const token: any = jwt.decode(requestToken);

  if (!params.emailId) {
    return {
      code: 400,
      message: 'parameter emailId harus di cantumkan',
    }
  }

  if (!/true|false/.test(params.reader)) {
    return {
      code: 400,
      message: 'parameter reader hanya boleh bernilai true dan false',
    }
  }

  try {
    const existingEmail = await surat.findFirst({
      where: {
        id: params.emailId,
        OR: [
          {
            penerima: token.role,
          },
          {
            penerima: 'all',
          },
        ]
      },
      select: {
        dibaca: true,
      }
    });

    if (!existingEmail) {
      return {
        code: 404,
        message: `email dengan id ${params.emailId} tidak ditemukan`,
      }
    }

    const oldReader = existingEmail.dibaca.split(' ');
    let newReader;

    if (params.reader === 'true') {
      newReader = [...oldReader, token.id].join(' ');
    } else {
      newReader = oldReader.filter((id) => id !== token.id).join(' ');
    }

    const payload = await surat.update({
      where: {
        id: params.emailId,
      },
      data: {
        dibaca: newReader,
      },
      select: {
        id: true,
        judul: true,
        body: true,
        dibaca: true,
        arsip: true,
        tanggal: true,
        penting: true,
        penerima: true,
        tb_user: {
          select: {
            id: true,
            name: true,
            username: true,
            role: true,
          }
        }
      }
    });

    return {
      code: 200,
      message: 'ok',
      payload: {
        ...payload,
        arsip: payload.arsip.split(' ').includes(token.id),
        dibaca: payload.dibaca.split(' ').includes(token.id),
      }
    }
  } catch (error) {
    console.error(error);

    return serverError();
  }
}

interface readEmailService {
  requestToken: string,
  params: {
    emailId: string,
    reader: string,
  },
}
