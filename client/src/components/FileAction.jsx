import React from 'react'
import Wrapper from '../assets/wrappers/FileActions'
import day from 'dayjs'

const FileAction = ({ fileAction }) => {
  return (
    <Wrapper>
      <div className='file-action-info'>
        <span className='import-type'>
          {fileAction.fileType.replace(/-/g, ' ')}
        </span>
        <span>{day(fileAction.createdAt).format('YYYY MMM DD h:mm A')}</span>
      </div>

      <div className='file-action-status'>
        <span
          className={
            fileAction.status
              ? `import-status import-status-${fileAction.status.replace(
                  /\\s+/g,
                  '-'
                )}`
              : 'import-status'
          }
        >
          {fileAction.status}
        </span>

        <span className='download-link'>
          Import File:{' '}
          <a href={fileAction.fileUrl} download>
            {fileAction.filePublicId}
          </a>
        </span>

        <span className='download-link'>
          Result File:{' '}
          <a href={fileAction.resultsFileUrl} download>
            {fileAction.resultsFilePublicId || ''}
          </a>
        </span>
      </div>
    </Wrapper>
  )
}

export default FileAction
